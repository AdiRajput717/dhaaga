const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const isValidObjectId = (value) =>
  typeof value === "string" && OBJECT_ID_REGEX.test(value);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parsePagination = (query, { defaultLimit = 12, maxLimit = 50 } = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || defaultLimit, 1),
    maxLimit
  );

  return { page, limit, skip: (page - 1) * limit };
};

const buildPagination = ({ page, limit }, total) => ({
  page,
  limit,
  total,
  pages: Math.max(Math.ceil(total / limit), 1),
});

module.exports = {
  isValidObjectId,
  escapeRegex,
  slugify,
  parsePagination,
  buildPagination,
};
