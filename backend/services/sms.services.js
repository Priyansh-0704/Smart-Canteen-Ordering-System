import axios from "axios";


// Send OTP
export const sendOtpSMS = async (mobile) => {
  console.log(`Sending OTP to +91${mobile} via 2Factor...`);
  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.OTP_API_KEY}/SMS/+91${mobile}/AUTOGEN`
    );

    console.log(" OTP send response:", response.data);

    if (response.data.Status === "Success") {

      return response.data.Details;
    } else {
      throw new Error(`Failed to send OTP: ${response.data.Details}`);
    }
  } catch (error) {
    console.error(" Error sending OTP via 2Factor:", error.message);
    throw error;
  }
};

// Verify OTP
export const verifyOtpSMS = async (sessionId, otp) => {
  console.log(`Verifying OTP ${otp} with sessionId ${sessionId}...`);
  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.OTP_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    console.log(" OTP verification response:", response.data);

    return response.data.Status === "Success";
  } catch (error) {
    console.error(" OTP verification failed:", error.message);
    throw error;
  }
}; 
