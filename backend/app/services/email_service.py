import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_otp_email(to_email: str, otp: str):
    """
    Sends an OTP verification email synchronously using smtplib.
    Designed to be run in a FastAPI BackgroundTask.
    """
    if not settings.EMAIL_USERNAME or not settings.EMAIL_PASSWORD:
        logger.warning("SMTP credentials not configured. Skipping email send.")
        logger.info(f"MOCK EMAIL SENT: to={to_email}, otp={otp}")
        return

    subject = "Verify your StockFlow account"
    
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #3b82f6;">Verify your StockFlow account</h2>
          <p>Hello,</p>
          <p>Your StockFlow verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1e40af; margin: 20px 0;">
            {otp}
          </div>
          <p>This OTP is valid for 5 minutes.</p>
          <p>If you did not request this email, you can safely ignore it.</p>
          <br>
          <p>Thank you,<br><strong>StockFlow Team</strong></p>
        </div>
      </body>
    </html>
    """

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = settings.EMAIL_FROM or settings.EMAIL_USERNAME
    message["To"] = to_email

    part = MIMEText(html_body, "html")
    message.attach(part)

    try:
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
        server.starttls()
        server.login(settings.EMAIL_USERNAME, settings.EMAIL_PASSWORD)
        server.sendmail(message["From"], message["To"], message.as_string())
        server.quit()
        logger.info(f"OTP email sent successfully to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        raise e
