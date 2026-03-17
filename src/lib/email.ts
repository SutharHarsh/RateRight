import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set - emails will not be sent');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@rateright.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('Email would be sent to:', to, 'Subject:', subject);
      return;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  await sendEmail({
    to: email,
    subject: 'Welcome to RateRight! 🎉',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366F1;">Welcome to RateRight, ${name}!</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Thank you for joining RateRight - your go-to platform for fair sponsorship rates.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          You're now part of a community of 10,000+ creators who know their worth and get paid fairly.
        </p>
        <div style="margin: 30px 0;">
          <a href="${APP_URL}/calculator" style="background: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Calculate Your First Rate
          </a>
        </div>
        <h3 style="color: #6366F1;">Quick Tips to Get Started:</h3>
        <ul style="font-size: 16px; line-height: 1.8; color: #334155;">
          <li>Calculate your engagement rate: (Likes + Comments) / Followers × 100</li>
          <li>Be honest about your metrics for accurate results</li>
          <li>Use your rate range to confidently negotiate with brands</li>
        </ul>
        <p style="font-size: 14px; color: #64748B; margin-top: 40px;">
          Need help? Reply to this email or visit our <a href="${APP_URL}/help" style="color: #6366F1;">Help Center</a>.
        </p>
      </div>
    `,
  });
}

export async function sendFirstCalculationEmail(email: string, name: string, rateRange: string) {
  await sendEmail({
    to: email,
    subject: 'Congrats on Your First Rate Calculation! 💰',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366F1;">Great Job, ${name}!</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          You've completed your first rate calculation. Your recommended rate is:
        </p>
        <div style="background: #F1F5F9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h2 style="color: #6366F1; font-size: 32px; margin: 0;">${rateRange}</h2>
        </div>
        <h3 style="color: #6366F1;">What This Means:</h3>
        <ul style="font-size: 16px; line-height: 1.8; color: #334155;">
          <li>This range is based on real data from similar creators</li>
          <li>Start negotiations at the higher end</li>
          <li>Don't accept less than the minimum unless there are other benefits</li>
        </ul>
        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Want to download a professional rate card to send to brands?
        </p>
        <div style="margin: 30px 0;">
          <a href="${APP_URL}/pricing" style="background: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Upgrade to Premium
          </a>
        </div>
        <p style="font-size: 14px; color: #64748B;">
          Use code <strong>CREATOR20</strong> for 20% off your first month! 🎉
        </p>
      </div>
    `,
  });
}

export async function sendFreeLimitReachedEmail(email: string, name: string) {
  await sendEmail({
    to: email,
    subject: "You've Used Your Free Calculations This Month",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366F1;">You're on Fire, ${name}! 🔥</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          You've used all 3 of your free rate calculations this month. We love to see creators being proactive!
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Your free calculations will reset next month, but why wait?
        </p>
        <h3 style="color: #6366F1;">Upgrade to Premium and Get:</h3>
        <ul style="font-size: 16px; line-height: 1.8; color: #334155;">
          <li>Unlimited rate calculations</li>
          <li>Detailed breakdown of how your rate is calculated</li>
          <li>Professional rate card templates</li>
          <li>Historical rate trends</li>
          <li>Negotiation scripts</li>
        </ul>
        <div style="margin: 30px 0;">
          <a href="${APP_URL}/pricing" style="background: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Upgrade to Premium - $19/month
          </a>
        </div>
        <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #92400E;">
            <strong>Special Offer:</strong> Use code <strong>CREATOR20</strong> for 20% off your first month!
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendUpgradeConfirmationEmail(email: string, name: string, plan: string) {
  await sendEmail({
    to: email,
    subject: `Welcome to RateRight ${plan}! 🎉`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366F1;">Welcome to ${plan}, ${name}!</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Thank you for upgrading! You now have full access to all ${plan} features.
        </p>
        <h3 style="color: #6366F1;">What You Can Do Now:</h3>
        <ul style="font-size: 16px; line-height: 1.8; color: #334155;">
          <li>Calculate unlimited sponsorship rates</li>
          <li>Download professional rate card PDFs</li>
          <li>See detailed rate breakdowns</li>
          <li>Access negotiation templates</li>
          <li>View historical rate trends</li>
        </ul>
        <div style="margin: 30px 0;">
          <a href="${APP_URL}/dashboard" style="background: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        <p style="font-size: 14px; color: #64748B; margin-top: 40px;">
          You can manage your subscription anytime in your <a href="${APP_URL}/settings" style="color: #6366F1;">account settings</a>.
        </p>
      </div>
    `,
  });
}

export async function sendPaymentFailedEmail(email: string, name: string) {
  await sendEmail({
    to: email,
    subject: 'Payment Failed - Action Required',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #EF4444;">Payment Issue</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Hi ${name},
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          We had trouble processing your payment for RateRight. This can happen for a few reasons:
        </p>
        <ul style="font-size: 16px; line-height: 1.8; color: #334155;">
          <li>Insufficient funds</li>
          <li>Expired card</li>
          <li>Card blocked by your bank</li>
        </ul>
        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Please update your payment method to continue enjoying RateRight Premium.
        </p>
        <div style="margin: 30px 0;">
          <a href="${APP_URL}/settings" style="background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Update Payment Method
          </a>
        </div>
        <p style="font-size: 14px; color: #64748B;">
          Your subscription will remain active for a few more days while we retry. After that, you'll be downgraded to the free plan.
        </p>
      </div>
    `,
  });
}

export async function sendMonthlyCalculationSummary(
  email: string,
  name: string,
  stats: {
    totalCalculations: number;
    averageRate: number;
    highestRate: number;
    potentialEarnings: number;
  }
) {
  await sendEmail({
    to: email,
    subject: 'Your Monthly RateRight Summary 📊',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366F1;">Your Monthly Summary, ${name}</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Here's a look at your activity on RateRight this month:
        </p>
        <div style="background: #F1F5F9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="margin-bottom: 16px;">
            <div style="font-size: 14px; color: #64748B;">Total Calculations</div>
            <div style="font-size: 24px; font-weight: bold; color: #6366F1;">${stats.totalCalculations}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 14px; color: #64748B;">Average Recommended Rate</div>
            <div style="font-size: 24px; font-weight: bold; color: #6366F1;">$${(stats.averageRate / 100).toFixed(0)}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 14px; color: #64748B;">Highest Rate Calculated</div>
            <div style="font-size: 24px; font-weight: bold; color: #6366F1;">$${(stats.highestRate / 100).toFixed(0)}</div>
          </div>
          <div>
            <div style="font-size: 14px; color: #64748B;">Potential Monthly Earnings</div>
            <div style="font-size: 24px; font-weight: bold; color: #10B981;">$${(stats.potentialEarnings / 100).toFixed(0)}</div>
          </div>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #334155;">
          Keep up the great work! The more you negotiate using fair rates, the better the entire creator economy becomes.
        </p>
      </div>
    `,
  });
}
