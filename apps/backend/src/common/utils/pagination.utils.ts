export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginationResult<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class PaginationUtils {
  /**
   * Default pagination values
   */
  static readonly DEFAULT_PAGE = 1;
  static readonly DEFAULT_LIMIT = 20;
  static readonly MAX_LIMIT = 100;

  /**
   * Parse pagination options with defaults
   */
  static parseOptions(options: PaginationOptions): Required<PaginationOptions> {
    const page = Math.max(1, options.page || this.DEFAULT_PAGE);
    const limit = Math.min(
      Math.max(1, options.limit || this.DEFAULT_LIMIT),
      this.MAX_LIMIT
    );

    return {
      page,
      limit,
      sortBy: options.sortBy || 'createdAt',
      sortOrder: options.sortOrder || 'DESC'
    };
  }

  /**
   * Calculate offset from page and limit
   */
  static calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Create pagination result
   */
  static createResult<T>(
    items: T[],
    totalItems: number,
    page: number,
    limit: number
  ): PaginationResult<T> {
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.min(page, totalPages || 1);

    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages,
        currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1
      }
    };
  }

  /**
   * Create cursor-based pagination token
   */
  static createCursor(id: string, timestamp: Date): string {
    const data = `${id}:${timestamp.getTime()}`;
    return Buffer.from(data).toString('base64');
  }

  /**
   * Parse cursor-based pagination token
   */
  static parseCursor(cursor: string): { id: string; timestamp: Date } | null {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      const [id, timestampStr] = decoded.split(':');
      const timestamp = new Date(parseInt(timestampStr));

      if (!id || isNaN(timestamp.getTime())) {
        return null;
      }

      return { id, timestamp };
    } catch {
      return null;
    }
  }

  /**
   * Build pagination links for API response
   */
  static buildLinks(
    baseUrl: string,
    page: number,
    limit: number,
    totalPages: number
  ): {
    first: string;
    previous: string | null;
    current: string;
    next: string | null;
    last: string;
  } {
    const url = new URL(baseUrl);

    const createUrl = (p: number) => {
      url.searchParams.set('page', p.toString());
      url.searchParams.set('limit', limit.toString());
      return url.toString();
    };

    return {
      first: createUrl(1),
      previous: page > 1 ? createUrl(page - 1) : null,
      current: createUrl(page),
      next: page < totalPages ? createUrl(page + 1) : null,
      last: createUrl(totalPages || 1)
    };
  }

  /**
   * Calculate page range for UI pagination
   */
  static getPageRange(
    currentPage: number,
    totalPages: number,
    maxVisible = 5
  ): number[] {
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    // Adjust if we're near the beginning or end
    if (currentPage <= half) {
      end = Math.min(totalPages, maxVisible);
    } else if (currentPage >= totalPages - half) {
      start = Math.max(1, totalPages - maxVisible + 1);
    }

    const range: number[] = [];
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  }
}