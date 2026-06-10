'use strict';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

function parsePagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const rawLimit = parseInt(query.limit, 10) || DEFAULT_LIMIT;
  const limit = Math.min(Math.max(rawLimit, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function buildPageMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

module.exports = { parsePagination, buildPageMeta, MAX_LIMIT, DEFAULT_LIMIT };
