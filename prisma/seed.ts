import { prisma } from "../src/lib/prisma";

async function main() {
  const products = [
    {
      code: "broker_os",
      name: "Broker OS",
      description: "外汇经纪商业务系统，包含 Portal、Backoffice 和 App",
      basePrice: 299,
      seatPrice: 29,
      currency: "USD",
      isActive: true,
      features: JSON.stringify({
        modules: [
          "portal",
          "backoffice",
          "mobile_app",
          "kyc",
          "funds",
          "trading_accounts",
        ],
      }),
    },
    {
      code: "growth_engine",
      name: "Growth Engine",
      description: "用户增长引擎，包含自动化营销、CDP、广告投放分析",
      basePrice: 199,
      seatPrice: 19,
      currency: "USD",
      isActive: true,
      features: JSON.stringify({
        modules: ["cdp", "marketing_automation", "ad_analytics", "promotion"],
      }),
    },
    {
      code: "trade_engine",
      name: "Trade Engine",
      description: "交易基础设施，包含风控、流动性聚合、保证金管理",
      basePrice: 499,
      seatPrice: 0,
      currency: "USD",
      isActive: true,
      features: JSON.stringify({
        modules: ["risk_engine", "lp_management", "margin_management"],
      }),
    },
    {
      code: "trading_engine",
      name: "Trading Engine",
      description: "交易终端套件，包含 Web Terminal、H5、跟单交易、API",
      basePrice: 399,
      seatPrice: 0,
      currency: "USD",
      isActive: true,
      features: JSON.stringify({
        modules: ["web_terminal", "h5", "social_copy_trading", "api_integration"],
      }),
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }

  console.log("Seeded products successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
