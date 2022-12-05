import { parse } from "url";

export function isValidImageUrl(url: string) {
	const protocol = parse(url).protocol;
	return ["http:", "https:"].includes(protocol ?? "");
}
