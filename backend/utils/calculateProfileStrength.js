// utils/calculateProfileStrength.js
const calculateProfileStrength = (user) => {
  let score = 20; // Base score for Registration

  if (user.companyName && user.companyName.trim() !== '') score += 20;
  if (user.companyType && user.companyType.trim() !== '') score += 15;
  if (user.gstin && user.gstin.trim() !== '') score += 15;
  if (user.pan && user.pan.trim() !== '') score += 15;
  if (user.mobileNumber && user.mobileNumber.trim() !== '') score += 15;

  return Math.min(score, 100);
};

module.exports = calculateProfileStrength;