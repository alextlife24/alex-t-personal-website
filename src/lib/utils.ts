/** 極簡 className 合併工具，避免為此再裝一個套件。 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
