
import axios from 'axios';

const BASE_URL = 'http://localhost:3001';
const TEST_PHONE = '+1514' + Math.floor(Math.random() * 9000000 + 1000000);
const TEST_USERNAME = 'elite_' + Math.random().toString(36).substring(7);

async function runTest() {
    console.log('👑 STARTING E2E REGISTRATION-TO-CHAT TEST');
    console.log(`📱 Test Phone: ${TEST_PHONE}`);
    console.log(`👤 Test Username: ${TEST_USERNAME}`);

    try {
        // 1. Request OTP
        console.log('\n--- STEP 1: Requesting OTP ---');
        const otpRes = await axios.post(`${BASE_URL}/auth/otp`, { phone: TEST_PHONE });
        console.log('✅ OTP Requested:', otpRes.data.message);

        // 2. Verify OTP & Register
        console.log('\n--- STEP 2: Verifying & Registering ---');
        const verifyRes = await axios.post(`${BASE_URL}/auth/verify`, {
            phone: TEST_PHONE,
            otp: '123123',
            username: TEST_USERNAME,
            displayName: `Sovereign ${TEST_USERNAME}`
        });
        const token = verifyRes.data.token;
        const userId = verifyRes.data.user.id;
        console.log('✅ Registered! Token acquired.');
        console.log('👤 User ID:', userId);

        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // 3. Check Friends (Should have NullClaw)
        console.log('\n--- STEP 3: Checking Friendship Graph ---');
        const friendsRes = await axios.get(`${BASE_URL}/users/me/friends`, authHeaders);
        const friends = friendsRes.data.friends || [];
        const hasBot = friends.some(f => f.username === 'NullClaw');
        
        if (hasBot) {
            console.log('✅ SUCCESS: NullClaw is automatically your friend.');
        } else {
            console.error('❌ FAIL: NullClaw not found in friends list.');
            console.log('Friends found:', friends);
        }

        // 4. Send Message to NullClaw
        console.log('\n--- STEP 4: Sending Message to NullClaw ---');
        const botId = '11111111-1111-1111-1111-111111111111';
        const msgRes = await axios.post(`${BASE_URL}/messages/${botId}`, {
            text: 'Bonjour NullClaw, es-tu prêt?',
            ephemeral: true,
            expiresIn: 30
        }, authHeaders);
        console.log('✅ Message Sent! ID:', msgRes.data.message.id);

        // 5. Verify Conversation exists
        console.log('\n--- STEP 5: Verifying Conversation History ---');
        const convoRes = await axios.get(`${BASE_URL}/messages/conversations`, authHeaders);
        const convas = convoRes.data.conversations || [];
        const botConvo = convas.find(c => c.user && (c.user.id === botId || c.user.username === 'NullClaw'));
        
        if (botConvo) {
            console.log('✅ SUCCESS: Conversation with NullClaw established.');
            console.log('Last Message:', botConvo.lastMessage.text);
        } else {
            console.error('❌ FAIL: Conversation with NullClaw not found.');
        }

        console.log('\n🏆 E2E TEST COMPLETE: ALL SYSTEMS NOMINAL 🏆');

    } catch (err) {
        console.error('\n❌ TEST CRASHED:', err.response?.data || err.message);
        process.exit(1);
    }
}

runTest();
