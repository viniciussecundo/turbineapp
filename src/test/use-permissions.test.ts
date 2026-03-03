import { describe, it, expect } from "vitest";
import { routeToModule } from "@/hooks/use-permissions";

describe("use-permissions", () => {
  describe("routeToModule", () => {
    it("maps / to dashboard module", () => {
      expect(routeToModule("/")).toBe("dashboard");
    });

    it("maps /clientes to clients module", () => {
      expect(routeToModule("/clientes")).toBe("clients");
    });

    it("returns null for unknown paths", () => {
      expect(routeToModule("/unknown")).toBeNull();
    });
  });
});
