/**
 * parse-themes.ts
 * AST extractor for `DarkColors` / `LightColors` object-literal exports in
 * caps-armory-app/constants/themes.ts. Uses ts-morph to enforce brand-purity:
 *   - both exports present
 *   - each is a plain ObjectLiteralExpression (no spreads, no computed keys)
 *   - all 20 REQUIRED_KEYS present, none unknown
 *   - all values are 6- or 8-digit hex string literals
 * Hex values are normalized to uppercase.
 */
import {
  Project,
  SyntaxKind,
  type ObjectLiteralExpression,
  type PropertyAssignment,
} from "ts-morph";

export const REQUIRED_KEYS = [
  "background",
  "surface",
  "surfaceElevated",
  "border",
  "gold",
  "goldLight",
  "olive",
  "oliveLight",
  "oliveMuted",
  "white",
  "black",
  "darkGrey",
  "textPrimary",
  "textSecondary",
  "textMuted",
  "success",
  "warning",
  "danger",
  "info",
  "cancelled",
] as const;

export type TokenKey = (typeof REQUIRED_KEYS)[number];
export type Palette = Record<TokenKey, string>;

const HEX = /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const REQUIRED_SET = new Set<string>(REQUIRED_KEYS);

function extractObjectLiteral(
  source: string,
  exportName: "DarkColors" | "LightColors",
): Palette {
  const project = new Project({ useInMemoryFileSystem: true });
  const sf = project.createSourceFile("themes.ts", source);
  const decl = sf.getVariableDeclaration(exportName);
  if (!decl) {
    throw new Error(`${exportName} not found in source`);
  }
  // Must be a top-level named export.
  const stmt = decl.getVariableStatement();
  if (!stmt || !stmt.isExported()) {
    throw new Error(`${exportName} not found as exported declaration`);
  }
  // Strip an optional `as const` wrapper if present.
  const asExpr = decl.getInitializerIfKind(SyntaxKind.AsExpression);
  const init = asExpr ? asExpr.getExpression() : decl.getInitializer();
  if (!init || init.getKind() !== SyntaxKind.ObjectLiteralExpression) {
    throw new Error(`${exportName} initializer is not an object literal`);
  }
  const obj = init as ObjectLiteralExpression;
  const result: Partial<Palette> = {};
  for (const prop of obj.getProperties()) {
    if (prop.getKind() !== SyntaxKind.PropertyAssignment) {
      throw new Error(
        `${exportName} contains non-literal entry: ${prop.getText()}`,
      );
    }
    const pa = prop as PropertyAssignment;
    const name = pa.getName();
    if (!REQUIRED_SET.has(name)) {
      throw new Error(`${exportName} contains unknown key: ${name}`);
    }
    const value = pa.getInitializerIfKind(SyntaxKind.StringLiteral);
    if (!value) {
      throw new Error(`${exportName}.${name} is not a string literal`);
    }
    const literal = value.getLiteralValue();
    if (!HEX.test(literal)) {
      throw new Error(
        `${exportName}.${name}: invalid hex literal "${literal}"`,
      );
    }
    (result as Record<string, string>)[name] = literal.toUpperCase();
  }
  for (const k of REQUIRED_KEYS) {
    if (!(k in result)) {
      throw new Error(`${exportName} missing key: ${k}`);
    }
  }
  return result as Palette;
}

export function parseThemes(source: string): { dark: Palette; light: Palette } {
  return {
    dark: extractObjectLiteral(source, "DarkColors"),
    light: extractObjectLiteral(source, "LightColors"),
  };
}
