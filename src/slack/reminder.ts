/**
 * Epoch reminder cron handler
 */

import {
  getEpochNumber,
  getDaysUntilNextEpoch,
} from '../types/config';
import { buildEpochReminderMessage } from './messages';
import { postSlackMessage } from './utils';
import type { Env } from './command';

/**
 * Handle the daily cron trigger to send epoch reminders
 */
export async function handleEpochReminder(env: Env): Promise<void> {
  const currentTimestamp = Date.now() / 1000;
  const daysUntil = getDaysUntilNextEpoch(currentTimestamp);
  const nextEpochNumber = getEpochNumber(currentTimestamp) + 1;

  // Send reminder if we're 3, 2, or 1 days before the epoch
  if (daysUntil <= 3 && daysUntil >= 1) {
    // Check if we already sent a reminder for this day
    const reminderKey = `reminder:epoch:${nextEpochNumber}:day:${daysUntil}`;
    const alreadySent = await env.EPOCH_CONFIG.get(reminderKey);

    if (alreadySent) {
      console.log(`Reminder already sent for epoch ${nextEpochNumber}, ${daysUntil} days out`);
      return;
    }

    // Build and send the reminder message
    const message = buildEpochReminderMessage(nextEpochNumber, daysUntil);

    try {
      await postSlackMessage(env.SLACK_CHANNEL, message, env.SLACK_BOT_TOKEN);

      // Mark this reminder as sent
      await env.EPOCH_CONFIG.put(reminderKey, 'sent', {
        expirationTtl: 60 * 60 * 24 * 7, // 7 days
      });

      console.log(`Sent epoch reminder for epoch ${nextEpochNumber}, ${daysUntil} days out`);
    } catch (error) {
      console.error('Failed to send epoch reminder:', error);
    }
  } else {
    console.log(`No reminder needed. Days until next epoch: ${daysUntil}`);
  }
}
