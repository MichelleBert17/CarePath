import { config } from '../config/env';
import { logger } from '../config/logger';
import prisma from '../config/database';

// Twilio is optional — if credentials not set, log only (useful for pilot phase)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let twilioClient: any = null;

if (config.twilioAccountSid && config.twilioAuthToken) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const twilio = require('twilio');
  twilioClient = twilio(config.twilioAccountSid, config.twilioAuthToken);
}

export const sendSms = async (
  to: string,
  message: string,
  options?: { rideRequestId?: string; driverId?: string; coordinatorId?: string }
): Promise<void> => {
  let twilioSid: string | undefined;
  let delivered = false;

  if (twilioClient) {
    try {
      const result = await twilioClient.messages.create({
        body: message,
        from: config.twilioPhoneNumber,
        to,
      });
      twilioSid = result.sid;
      delivered = true;
      logger.info('SMS sent', { to, sid: twilioSid });
    } catch (err) {
      logger.error('SMS send failed', { to, err });
    }
  } else {
    logger.info('[SMS DRY-RUN]', { to, message });
    delivered = false;
  }

  await prisma.notification.create({
    data: {
      channel: 'sms',
      recipient: to,
      message,
      sentAt: new Date(),
      delivered,
      twilioSid,
      rideRequestId: options?.rideRequestId,
      driverId: options?.driverId,
      coordinatorId: options?.coordinatorId,
    },
  });
};

// Pre-built message templates
export const messages = {
  rideConfirmed: (driverName: string, pickupTime: string) =>
    `Your CarePath ride is confirmed. ${driverName} will pick you up at ${pickupTime}. Reply STOP to opt out.`,

  rideReminder: (pickupTime: string) =>
    `Reminder: Your CarePath ride is tomorrow at ${pickupTime}. Reply HELP for assistance.`,

  fallbackActivated: (coordinatorPhone: string) =>
    `Your scheduled driver is unavailable. Our coordinator is finding a backup now. Call ${coordinatorPhone} if urgent.`,

  driverAssigned: (patientName: string, pickupAddress: string, pickupTime: string) =>
    `CarePath: You have a ride request. Patient: ${patientName}. Pickup: ${pickupAddress} at ${pickupTime}. Reply YES to confirm.`,

  rideCompleted: () =>
    `Your CarePath ride is complete. Thank you for using CarePath. Your care matters.`,
};
