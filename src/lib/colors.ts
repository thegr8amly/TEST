const COLORS: Record<string, string> = { A0: "#94a3b8", A1: "#d13b45", A2: "#eb7419", B1: "#f5a03a", B2: "#0a79b8", C1: "#26467f", C2: "#43a535" };
export const cefrColorStatic = (c?: string | null) => (c ? COLORS[c] ?? "#132544" : "#cbd5e1");
