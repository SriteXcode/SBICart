const cron = require("node-cron");
const webpush = require("web-push");
const PTP = require("./models/PTP");
const User = require("./models/User");

webpush.setVapidDetails(
  "mailto:example@yourdomain.org",
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

const initScheduler = () => {
  // Run every day at 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    console.log("Running daily PTP check...");
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find PTPs due today that are pending
      const duePTPs = await PTP.find({
        ptpDate: { $gte: today, $lt: tomorrow },
        status: "Pending",
      });

      console.log(`Found ${duePTPs.length} PTPs due today.`);

      // Group by user to send one summary notification or individual ones
      // Let's send individual ones for simplicity for now, or grouped? 
      // Grouping is better to avoid spam.
      
      const userPTPs = {};
      
      for (const ptp of duePTPs) {
        if (!userPTPs[ptp.user]) {
          userPTPs[ptp.user] = [];
        }
        userPTPs[ptp.user].push(ptp);
      }

      for (const userId in userPTPs) {
        const user = await User.findById(userId);
        if (user && user.pushSubscription) {
            const ptpList = userPTPs[userId];
            const count = ptpList.length;
            const message = count === 1 
                ? `Reminder: ${ptpList[0].name} promised to pay today.` 
                : `You have ${count} PTP promises due today.`;

            const payload = JSON.stringify({
                title: "Daily PTP Reminder",
                body: message,
                icon: "/vite.svg" // Adjust path if hosted
            });

            try {
                await webpush.sendNotification(user.pushSubscription, payload);
                console.log(`Notification sent to user ${user.name}`);
            } catch (err) {
                console.error(`Failed to send notification to ${user.name}:`, err);
                // If 410 Gone, we should remove the subscription, but skipping for now
            }
        }
      }

    } catch (err) {
      console.error("Scheduler Error:", err);
    }
  });
};

module.exports = initScheduler;
