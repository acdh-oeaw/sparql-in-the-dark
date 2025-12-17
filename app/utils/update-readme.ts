import fs from "node:fs";
import path from "node:path";

const contentDir = "./content/queries";
const intro = "./content/intro.md";
const outputFile = "./README.md";

function generateTableOfContents(titles: Array<string>): string {
	return titles
		.map((title) => {
			const name = title;
			const anchor = name.toLowerCase().replace(/\s+/g, "-");
			return `- [${name}](#${anchor})`;
		})
		.join("\n");
}

function generateReadme(): void {
	const files = fs
		.readdirSync(contentDir)
		.filter((file) => file.endsWith(".md"))
		.sort();

	if (files.length === 0) {
		console.log("No markdown files found in ", contentDir);
		return;
	}
	let content = "";
	const titles: Array<string> = [];
	files.forEach((file) => {
		const filePath = path.join(contentDir, file);
		const fileContent = fs.readFileSync(filePath, "utf-8");
		const heading = /^# *(.*)/m.exec(fileContent)?.[1] ?? "";
		titles.push(heading);
		const shiftedFileContent = fileContent.replaceAll(/^#/gm, "##");
		content += `${shiftedFileContent}\n\n`;
	});

	const introContent = fs.readFileSync(intro, "utf-8");
	const toc = generateTableOfContents(titles);
	content = `${introContent}## Table of Contents\n\n${toc}\n\n${content}`;

	fs.writeFileSync(outputFile, content);
	console.log(`README.md generated successfully with ${String(files.length)} files`);
}

generateReadme();
