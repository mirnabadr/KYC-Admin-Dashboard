/**
 * Rates Controller
 * Handles exchange rate requests with caching
 */
import { fetchRate } from '../services/cybridApi.js';
import { writeAuditLog, getClientIp } from '../services/auditService.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * Get exchange rate
 * GET /api/rates?from=USD&to=USDC
 */
export const getRate = asyncHandler(async (req, res) => {
  const { from = 'USD', to = 'USDC' } = req.query;

  // Validate currency codes
  const validCurrencies = ['USD', 'USDC', 'EUR', 'GBP', 'JPY'];
  if (!validCurrencies.includes(from) || !validCurrencies.includes(to)) {
    throw new AppError('Invalid currency code', 400, 'VALIDATION_ERROR');
  }

  // Fetch rate (with caching handled in service)
  const rateData = await fetchRate(from, to);

  // Log rate fetch (optional - can be disabled for high-volume endpoints)
  if (req.user) {
    await writeAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'Fetch Rate',
      status: 'Success',
      details: `Fetched ${from}/${to} rate: ${rateData.rate}`,
      resourceType: 'Rate',
      ipAddress: getClientIp(req),
    });
  }

  res.json({
    success: true,
    ...rateData,
  });
});
