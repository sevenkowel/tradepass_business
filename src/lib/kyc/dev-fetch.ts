/**
 * Dev-aware fetch wrapper
 * 在开发环境中自动从 KYCMockConfig store 读取配置并注入到 KYC API 请求 header 中
 */

/**
 * 构建 mock 配置 headers
 * 从 localStorage 读取 KYCMockConfig 的值
 * 必须在客户端调用
 */
function getMockHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem("kyc-mock-config");
    if (!stored) return {};

    const config = JSON.parse(stored);
    const state = config?.state;
    if (!state) return {};

    const headers: Record<string, string> = {};

    // OCR 配置
    if (state.ocrConfidence !== undefined) {
      headers["X-Mock-OCR-Confidence"] = String(state.ocrConfidence);
    }
    if (state.ocrSimulateError) {
      headers["X-Mock-OCR-Error"] = "true";
    }

    // 活体检测配置
    if (state.livenessPassRate !== undefined) {
      headers["X-Mock-Liveness-Pass-Rate"] = String(state.livenessPassRate);
    }
    if (state.livenessForceResult && state.livenessForceResult !== "auto") {
      headers["X-Mock-Liveness-Force"] = state.livenessForceResult;
    }

    // 审核配置
    if (state.reviewForceResult && state.reviewForceResult !== "auto") {
      headers["X-Mock-Review-Force"] = state.reviewForceResult;
    }

    return headers;
  } catch {
    return {};
  }
}

/**
 * 增强的 fetch，自动为 KYC API 注入 mock 配置 headers
 */
export function devFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // 仅对 KYC API 注入 mock headers
  if (typeof window !== "undefined" && url.includes("/api/kyc/")) {
    const mockHeaders = getMockHeaders();
    const existingHeaders = new Headers(options.headers);

    Object.entries(mockHeaders).forEach(([key, value]) => {
      existingHeaders.set(key, value);
    });

    return fetch(url, {
      ...options,
      headers: existingHeaders,
    });
  }

  return fetch(url, options);
}
