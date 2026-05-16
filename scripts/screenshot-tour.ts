import { runTest } from "./auth";

runTest("PropEdge AI Screenshots", async (helper) => {
	const { page } = helper;

	console.log("Starting screenshot tour...");

	// Dashboard (already logged in)
	await helper.goto("/dashboard");
	console.log("On dashboard, waiting for data...");
	await page.waitForTimeout(3000);
	await page.screenshot({
		path: "screenshots/02-dashboard.png",
		fullPage: false,
	});
	console.log("Dashboard screenshot taken");

	// Props Analyzer
	await helper.goto("/props");
	console.log("On props page...");
	await page.waitForTimeout(2500);
	await page.screenshot({ path: "screenshots/03-props.png", fullPage: false });
	console.log("Props screenshot taken");

	// AI Chat
	await helper.goto("/chat");
	console.log("On chat page...");
	await page.waitForTimeout(1500);
	await page.screenshot({ path: "screenshots/04-chat.png", fullPage: false });
	console.log("Chat screenshot taken");

	// Pick Builder
	await helper.goto("/builder");
	console.log("On builder page...");
	await page.waitForTimeout(1500);
	await page.screenshot({
		path: "screenshots/05-builder.png",
		fullPage: false,
	});
	console.log("Builder screenshot taken");

	// My Picks
	await helper.goto("/my-picks");
	console.log("On my picks page...");
	await page.waitForTimeout(1500);
	await page.screenshot({
		path: "screenshots/06-my-picks.png",
		fullPage: false,
	});
	console.log("My picks screenshot taken");

	// Leaderboard
	await helper.goto("/leaderboard");
	console.log("On leaderboard page...");
	await page.waitForTimeout(2500);
	await page.screenshot({
		path: "screenshots/07-leaderboard.png",
		fullPage: false,
	});
	console.log("Leaderboard screenshot taken");

	// Settings
	await helper.goto("/settings");
	console.log("On settings page...");
	await page.waitForTimeout(1500);
	await page.screenshot({
		path: "screenshots/08-settings.png",
		fullPage: false,
	});
	console.log("Settings screenshot taken");

	console.log("All screenshots taken!");
}).catch((e) => {
	console.error("Test failed:", e);
	process.exit(1);
});
