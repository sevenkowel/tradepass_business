/**
 * Internationalization Configuration
 * Supports: English, Chinese (Simplified), Japanese, Spanish
 */

export type Locale = "en" | "zh" | "ja" | "es";

export const locales: Locale[] = ["en", "zh", "ja", "es"];
export const defaultLocale: Locale = "zh";

export const localeNames: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  ja: "日本語",
  es: "Español",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  zh: "🇨🇳",
  ja: "🇯🇵",
  es: "🇪🇸",
};

// Simple translation helper (no heavy i18n library needed for now)
export function t(key: string, locale: Locale = defaultLocale, params?: Record<string, string>): string {
  const dict = dictionaries[locale] || dictionaries[defaultLocale];
  let text = dict[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`{{${k}}}`, "g"), v);
    });
  }
  return text;
}

export const dictionaries: Record<Locale, Record<string, string>> = {
  en: {
    // Common
    "app.name": "TradePass",
    "app.tagline": "Broker SaaS Platform",
    "nav.dashboard": "Dashboard",
    "nav.tenants": "Tenants",
    "nav.products": "Products",
    "nav.modules": "Product Matrix",
    "nav.billing": "Billing",
    "nav.settings": "Settings",
    "nav.admin": "Admin",
    "action.save": "Save",
    "action.cancel": "Cancel",
    "action.delete": "Delete",
    "action.edit": "Edit",
    "action.create": "Create",
    "action.confirm": "Confirm",
    "action.back": "Back",
    "action.next": "Next",
    "action.search": "Search",
    "action.filter": "Filter",
    "action.export": "Export",
    "action.import": "Import",
    "status.active": "Active",
    "status.inactive": "Inactive",
    "status.pending": "Pending",
    "status.completed": "Completed",
    "status.failed": "Failed",

    // Auth
    "auth.login": "Sign In",
    "auth.register": "Sign Up",
    "auth.logout": "Sign Out",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot Password?",
    "auth.rememberMe": "Remember Me",

    // Billing
    "billing.plan": "Plan",
    "billing.price": "Price",
    "billing.currency": "Currency",
    "billing.monthly": "Monthly",
    "billing.yearly": "Yearly",
    "billing.upgrade": "Upgrade",
    "billing.downgrade": "Downgrade",
    "billing.currentPlan": "Current Plan",
    "billing.trial": "Trial",
    "billing.trialEnds": "Trial ends on {{date}}",
    "billing.invoice": "Invoice",
    "billing.payNow": "Pay Now",
    "billing.promoCode": "Promo Code",
    "billing.applyPromo": "Apply",
    "billing.promoApplied": "Promo applied: {{code}}",

    // Modules
    "modules.growth_engine": "Growth Engine",
    "modules.trade_engine": "Trade Engine",
    "modules.trading_engine": "Trading Engine",
    "modules.subscribe": "Subscribe",
    "modules.startTrial": "Start 14-Day Trial",
    "modules.trialActive": "Trial Active",
    "modules.seats": "Seats",

    // Promo
    "promo.title": "Promo Codes",
    "promo.code": "Code",
    "promo.discount": "Discount",
    "promo.uses": "Uses",
    "promo.validUntil": "Valid Until",
    "promo.create": "Create Promo Code",
    "promo.percentage": "Percentage",
    "promo.fixedAmount": "Fixed Amount",
    "promo.freeMonths": "Free Months",
  },
  zh: {
    // Common
    "app.name": "TradePass",
    "app.tagline": "经纪商 SaaS 平台",
    "nav.dashboard": "仪表盘",
    "nav.tenants": "租户管理",
    "nav.products": "产品管理",
    "nav.modules": "产品矩阵",
    "nav.billing": "账单管理",
    "nav.settings": "设置",
    "nav.admin": "管理后台",
    "action.save": "保存",
    "action.cancel": "取消",
    "action.delete": "删除",
    "action.edit": "编辑",
    "action.create": "创建",
    "action.confirm": "确认",
    "action.back": "返回",
    "action.next": "下一步",
    "action.search": "搜索",
    "action.filter": "筛选",
    "action.export": "导出",
    "action.import": "导入",
    "status.active": "已激活",
    "status.inactive": "未激活",
    "status.pending": "待处理",
    "status.completed": "已完成",
    "status.failed": "失败",

    // Auth
    "auth.login": "登录",
    "auth.register": "注册",
    "auth.logout": "退出登录",
    "auth.email": "邮箱",
    "auth.password": "密码",
    "auth.forgotPassword": "忘记密码？",
    "auth.rememberMe": "记住我",

    // Billing
    "billing.plan": "套餐",
    "billing.price": "价格",
    "billing.currency": "货币",
    "billing.monthly": "月付",
    "billing.yearly": "年付",
    "billing.upgrade": "升级",
    "billing.downgrade": "降级",
    "billing.currentPlan": "当前套餐",
    "billing.trial": "试用",
    "billing.trialEnds": "试用将于 {{date}} 到期",
    "billing.invoice": "账单",
    "billing.payNow": "立即支付",
    "billing.promoCode": "优惠码",
    "billing.applyPromo": "应用",
    "billing.promoApplied": "已应用优惠码：{{code}}",

    // Modules
    "modules.growth_engine": "增长引擎",
    "modules.trade_engine": "交易引擎",
    "modules.trading_engine": "交易平台",
    "modules.subscribe": "订阅",
    "modules.startTrial": "开始 14 天试用",
    "modules.trialActive": "试用中",
    "modules.seats": "席位",

    // Promo
    "promo.title": "优惠码管理",
    "promo.code": "优惠码",
    "promo.discount": "折扣",
    "promo.uses": "使用次数",
    "promo.validUntil": "有效期至",
    "promo.create": "创建优惠码",
    "promo.percentage": "百分比折扣",
    "promo.fixedAmount": "固定金额",
    "promo.freeMonths": "免费月数",
  },
  ja: {
    // Common
    "app.name": "TradePass",
    "app.tagline": "ブローカーSaaSプラットフォーム",
    "nav.dashboard": "ダッシュボード",
    "nav.tenants": "テナント管理",
    "nav.products": "製品管理",
    "nav.modules": "製品マトリックス",
    "nav.billing": "課金管理",
    "nav.settings": "設定",
    "nav.admin": "管理画面",
    "action.save": "保存",
    "action.cancel": "キャンセル",
    "action.delete": "削除",
    "action.edit": "編集",
    "action.create": "作成",
    "action.confirm": "確認",
    "action.back": "戻る",
    "action.next": "次へ",
    "action.search": "検索",
    "action.filter": "フィルタ",
    "action.export": "エクスポート",
    "action.import": "インポート",
    "status.active": "有効",
    "status.inactive": "無効",
    "status.pending": "保留中",
    "status.completed": "完了",
    "status.failed": "失敗",

    // Auth
    "auth.login": "ログイン",
    "auth.register": "登録",
    "auth.logout": "ログアウト",
    "auth.email": "メール",
    "auth.password": "パスワード",
    "auth.forgotPassword": "パスワードを忘れた？",
    "auth.rememberMe": "記憶する",

    // Billing
    "billing.plan": "プラン",
    "billing.price": "価格",
    "billing.currency": "通貨",
    "billing.monthly": "月払い",
    "billing.yearly": "年払い",
    "billing.upgrade": "アップグレード",
    "billing.downgrade": "ダウングレード",
    "billing.currentPlan": "現在のプラン",
    "billing.trial": "試用",
    "billing.trialEnds": "試用期限：{{date}}",
    "billing.invoice": "請求書",
    "billing.payNow": "今すぐ支払う",
    "billing.promoCode": "プロモコード",
    "billing.applyPromo": "適用",
    "billing.promoApplied": "プロモ適用：{{code}}",

    // Modules
    "modules.growth_engine": "グロースエンジン",
    "modules.trade_engine": "トレードエンジン",
    "modules.trading_engine": "トレーディングエンジン",
    "modules.subscribe": "申し込む",
    "modules.startTrial": "14日間の試用を開始",
    "modules.trialActive": "試用中",
    "modules.seats": "シート数",

    // Promo
    "promo.title": "プロモコード管理",
    "promo.code": "コード",
    "promo.discount": "割引",
    "promo.uses": "使用回数",
    "promo.validUntil": "有効期限",
    "promo.create": "プロモコードを作成",
    "promo.percentage": "割合割引",
    "promo.fixedAmount": "固定金額",
    "promo.freeMonths": "無料月数",
  },
  es: {
    // Common
    "app.name": "TradePass",
    "app.tagline": "Plataforma SaaS para Brokers",
    "nav.dashboard": "Panel",
    "nav.tenants": "Gestión de Inquilinos",
    "nav.products": "Gestión de Productos",
    "nav.modules": "Matriz de Productos",
    "nav.billing": "Facturación",
    "nav.settings": "Configuración",
    "nav.admin": "Panel de Admin",
    "action.save": "Guardar",
    "action.cancel": "Cancelar",
    "action.delete": "Eliminar",
    "action.edit": "Editar",
    "action.create": "Crear",
    "action.confirm": "Confirmar",
    "action.back": "Atrás",
    "action.next": "Siguiente",
    "action.search": "Buscar",
    "action.filter": "Filtrar",
    "action.export": "Exportar",
    "action.import": "Importar",
    "status.active": "Activo",
    "status.inactive": "Inactivo",
    "status.pending": "Pendiente",
    "status.completed": "Completado",
    "status.failed": "Fallido",

    // Auth
    "auth.login": "Iniciar Sesión",
    "auth.register": "Registrarse",
    "auth.logout": "Cerrar Sesión",
    "auth.email": "Correo",
    "auth.password": "Contraseña",
    "auth.forgotPassword": "¿Olvidaste tu contraseña?",
    "auth.rememberMe": "Recuérdame",

    // Billing
    "billing.plan": "Plan",
    "billing.price": "Precio",
    "billing.currency": "Moneda",
    "billing.monthly": "Mensual",
    "billing.yearly": "Anual",
    "billing.upgrade": "Actualizar",
    "billing.downgrade": "Degradar",
    "billing.currentPlan": "Plan Actual",
    "billing.trial": "Prueba",
    "billing.trialEnds": "La prueba termina el {{date}}",
    "billing.invoice": "Factura",
    "billing.payNow": "Pagar Ahora",
    "billing.promoCode": "Código Promocional",
    "billing.applyPromo": "Aplicar",
    "billing.promoApplied": "Promo aplicado: {{code}}",

    // Modules
    "modules.growth_engine": "Motor de Crecimiento",
    "modules.trade_engine": "Motor de Trading",
    "modules.trading_engine": "Plataforma de Trading",
    "modules.subscribe": "Suscribirse",
    "modules.startTrial": "Iniciar Prueba de 14 Días",
    "modules.trialActive": "Prueba Activa",
    "modules.seats": "Asientos",

    // Promo
    "promo.title": "Gestión de Códigos Promocionales",
    "promo.code": "Código",
    "promo.discount": "Descuento",
    "promo.uses": "Usos",
    "promo.validUntil": "Válido Hasta",
    "promo.create": "Crear Código Promocional",
    "promo.percentage": "Porcentaje",
    "promo.fixedAmount": "Monto Fijo",
    "promo.freeMonths": "Meses Gratis",
  },
};
