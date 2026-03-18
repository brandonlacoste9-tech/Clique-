
import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function runTest() {
    console.log('⚜️ STARTING AURUM SCREENSHOT VIGILANCE TEST ⚜️');

    try {
        // 1. Register/Login the Owner (Victim of screenshot)
        const OWNER_PHONE = '+15149000001';
        await axios.post(`${BASE_URL}/auth/otp`, { phone: OWNER_PHONE });
        const ownerRes = await axios.post(`${BASE_URL}/auth/verify`, {
            phone: OWNER_PHONE,
            otp: '123123',
            username: 'sovereign_owner'
        });
        const ownerToken = ownerRes.data.token;
        const ownerId = ownerRes.data.user.id;
        const ownerHeaders = { headers: { Authorization: `Bearer ${ownerToken}` } };

        // 2. Owner posts a story
        console.log('\n--- Owner posting a Golden Story ---');
        const storyPostRes = await axios.post(`${BASE_URL}/upload/story`, {
            mediaKey: 'uploads/owner/story-1.jpg',
            mediaType: 'image',
            mood: 'Sovereign View',
            expiresAt: new Date(Date.now() + 86400000).toISOString()
        }, ownerHeaders);
        const storyId = storyPostRes.data.story.id;

        // 3. Register/Login the Viewer (The one who screenshots)
        const VIEWER_PHONE = '+15149000002';
        await axios.post(`${BASE_URL}/auth/otp`, { phone: VIEWER_PHONE });
        const viewerRes = await axios.post(`${BASE_URL}/auth/verify`, {
            phone: VIEWER_PHONE,
            otp: '123123',
            username: 'architect_tester'
        });
        const viewerToken = viewerRes.data.token;
        const viewerHeaders = { headers: { Authorization: `Bearer ${viewerToken}` } };

        // 4. Viewer screenshots the story
        console.log('\n--- Viewer capturing screenshot of story ---');
        await axios.post(`${BASE_URL}/stories/${storyId}/view`, {
            screenshotDetected: true
        }, viewerHeaders);

        // 5. Check if Owner received an AURUM Alert
        console.log('\n--- Checking Owner Conversations for AURUM Alert ---');
        const convRes = await axios.get(`${BASE_URL}/messages/conversations`, ownerHeaders);
        
        const aurumConv = convRes.data.conversations.find(c => c.user.username === 'AURUM');
        
        if (aurumConv && aurumConv.lastMessage.text.includes('architect_tester')) {
            console.log('\n🎯 AURUM ALERT RECEIVED!');
            console.log(`Message: "${aurumConv.lastMessage.text}"`);
            console.log('\n🏆 SUCCESS: Screenshot Vigilance is live and reporting.');
        } else {
            console.error('\n❌ FAIL: Screenshot alert was not delivered.');
            console.log('Available Conversations:', convRes.data.conversations.map(c => c.user.username));
        }

    } catch (err) {
        console.error('\n❌ TEST CRASHED:', err.response?.data || err.message);
    }
}

runTest();
