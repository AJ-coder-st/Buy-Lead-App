import { PrismaClient, Buyer, Prisma } from '@prisma/client';
import { CreateBuyerInput, UpdateBuyerInput, BuyerQuery } from '../validators/buyer';

const prisma = new PrismaClient();

export class BuyerService {
  async createBuyer(data: CreateBuyerInput, ownerId: string): Promise<Buyer> {
    const buyerData = {
      ...data,
      email: data.email || null,
      tags: JSON.stringify(data.tags || []),
      ownerId,
    };

    const buyer = await prisma.buyer.create({
      data: buyerData,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Create history entry
    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: ownerId,
        diff: JSON.stringify({ created: buyer })
      }
    });

    return buyer;
  }

  async updateBuyer(
    id: string, 
    data: UpdateBuyerInput, 
    userId: string, 
    userRole: string
  ): Promise<Buyer> {
    // Get current buyer for concurrency check and ownership
    const currentBuyer = await prisma.buyer.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!currentBuyer) {
      throw new Error('Buyer not found');
    }

    // Check ownership (unless admin)
    if (userRole !== 'admin' && currentBuyer.ownerId !== userId) {
      throw new Error('Access denied: You can only edit your own buyers');
    }

    // Check optimistic concurrency
    const providedUpdatedAt = new Date(data.updatedAt);
    if (currentBuyer.updatedAt.getTime() !== providedUpdatedAt.getTime()) {
      throw new Error('STALE_DATA');
    }

    // Calculate diff for history
    const diff: Record<string, [any, any]> = {};
    const { updatedAt, ...updateData } = data;
    
    Object.entries(updateData).forEach(([key, newValue]) => {
      const oldValue = (currentBuyer as any)[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        diff[key] = [oldValue, newValue];
      }
    });

    const buyerData = {
      ...updateData,
      email: updateData.email || null,
      tags: JSON.stringify(updateData.tags || []),
    };

    // Update buyer and create history in transaction
    const [updatedBuyer] = await prisma.$transaction([
      prisma.buyer.update({
        where: { id },
        data: buyerData,
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.buyerHistory.create({
        data: {
          buyerId: id,
          changedBy: userId,
          diff: JSON.stringify(diff)
        }
      })
    ]);

    return updatedBuyer;
  }

  async getBuyer(id: string, userId: string, userRole: string): Promise<Buyer | null> {
    const buyer = await prisma.buyer.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!buyer) {
      return null;
    }

    // Check ownership (unless admin)
    if (userRole !== 'admin' && buyer.ownerId !== userId) {
      throw new Error('Access denied: You can only view your own buyers');
    }

    return buyer;
  }

  async deleteBuyer(id: string, userId: string, userRole: string): Promise<void> {
    const buyer = await prisma.buyer.findUnique({
      where: { id }
    });

    if (!buyer) {
      throw new Error('Buyer not found');
    }

    // Check ownership (unless admin)
    if (userRole !== 'admin' && buyer.ownerId !== userId) {
      throw new Error('Access denied: You can only delete your own buyers');
    }

    await prisma.buyer.delete({
      where: { id }
    });
  }

  async listBuyers(query: BuyerQuery, userId: string, userRole: string) {
    const { page, pageSize, q, city, propertyType, status, timeline, sort } = query;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.BuyerWhereInput = {
      // Only show user's own buyers unless admin
      ...(userRole !== 'admin' && { ownerId: userId }),
      ...(city && { city }),
      ...(propertyType && { propertyType }),
      ...(status && { status }),
      ...(timeline && { timeline }),
      ...(q && {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } },
          { email: { contains: q, mode: 'insensitive' } },
        ]
      })
    };

    // Build order by
    const [sortField, sortDirection] = sort.split('_') as [string, 'asc' | 'desc'];
    const orderBy = { [sortField]: sortDirection };

    const [buyers, total] = await Promise.all([
      prisma.buyer.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.buyer.count({ where })
    ]);

    return {
      buyers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1
      }
    };
  }

  async getBuyerHistory(buyerId: string, limit = 5) {
    return prisma.buyerHistory.findMany({
      where: { buyerId },
      orderBy: { changedAt: 'desc' },
      take: limit,
      include: {
        buyer: {
          select: { id: true, fullName: true }
        }
      }
    });
  }

  async importBuyersFromCSV(
    rows: any[], 
    ownerId: string
  ): Promise<{ insertedCount: number; errors: Array<{ row: number; errors: string[] }> }> {
    const errors: Array<{ row: number; errors: string[] }> = [];
    const validRows: any[] = [];

    // Validate each row
    rows.forEach((row, index) => {
      try {
        // Parse tags if present - keep as string for validation
        if (row.tags && row.tags !== '') {
          // Validate that it's valid JSON or comma-separated
          try {
            JSON.parse(row.tags);
            // Keep as string for validation
          } catch {
            // Convert comma-separated to JSON string
            const tagArray = row.tags.split(',').map((tag: string) => tag.trim());
            row.tags = JSON.stringify(tagArray);
          }
        } else {
          row.tags = '';
        }

        // Convert empty strings to null/undefined
        Object.keys(row).forEach(key => {
          if (row[key] === '') {
            if (['email', 'notes', 'bhk', 'status'].includes(key)) {
              row[key] = null;
            } else if (['budgetMin', 'budgetMax'].includes(key)) {
              row[key] = undefined;
            } else if (key === 'tags') {
              row[key] = '';
            }
          }
        });

        // Validate with schema
        const { validateCSVRow } = require('../validators/buyer');
        const validation = validateCSVRow(row);
        
        if (!validation.isValid) {
          console.log(`Row ${index + 1} validation errors:`, validation.errors);
          console.log(`Row ${index + 1} data:`, JSON.stringify(row, null, 2));
          errors.push({ row: index + 1, errors: validation.errors });
        } else {
          validRows.push({
            ...row,
            tags: JSON.stringify(row.tags || []),
            ownerId
          });
        }
      } catch (error) {
        errors.push({ 
          row: index + 1, 
          errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
        });
      }
    });

    // Insert valid rows in transaction
    let insertedCount = 0;
    if (validRows.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const row of validRows) {
          const buyer = await tx.buyer.create({
            data: row
          });

          await tx.buyerHistory.create({
            data: {
              buyerId: buyer.id,
              changedBy: ownerId,
              diff: JSON.stringify({ imported: buyer })
            }
          });

          insertedCount++;
        }
      });
    }

    return { insertedCount, errors };
  }

  async exportBuyersToCSV(query: BuyerQuery, userId: string, userRole: string): Promise<any[]> {
    const { q, city, propertyType, status, timeline } = query;

    const where: Prisma.BuyerWhereInput = {
      ...(userRole !== 'admin' && { ownerId: userId }),
      ...(city && { city }),
      ...(propertyType && { propertyType }),
      ...(status && { status }),
      ...(timeline && { timeline }),
      ...(q && {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } },
          { email: { contains: q, mode: 'insensitive' } },
        ]
      })
    };

    const buyers = await prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    });

    return buyers.map(buyer => ({
      fullName: buyer.fullName,
      email: buyer.email || '',
      phone: buyer.phone,
      city: buyer.city,
      propertyType: buyer.propertyType,
      bhk: buyer.bhk || '',
      purpose: buyer.purpose,
      budgetMin: buyer.budgetMin || '',
      budgetMax: buyer.budgetMax || '',
      timeline: buyer.timeline,
      source: buyer.source,
      notes: buyer.notes || '',
      tags: buyer.tags,
      status: buyer.status
    }));
  }
}
