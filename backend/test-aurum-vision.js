
import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function runTest() {
    console.log('⚜️ STARTING AURUM STORY VISION TEST ⚜️');

    try {
        // 1. Register or Login as a test user
        const TEST_PHONE = '+15148000001';
        await axios.post(`${BASE_URL}/auth/otp`, { phone: TEST_PHONE });
        const verifyRes = await axios.post(`${BASE_URL}/auth/verify`, {
            phone: TEST_PHONE,
            otp: '123123',
            username: 'vision_tester'
        });
        const token = verifyRes.data.token;
        const myUserId = verifyRes.data.user.id;
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Register/Create the Target "Isabelle"
        const TARGET_PHONE = '+15148000002';
        await axios.post(`${BASE_URL}/auth/otp`, { phone: TARGET_PHONE });
        const targetRes = await axios.post(`${BASE_URL}/auth/verify`, {
            phone: TARGET_PHONE,
            otp: '123123',
            username: 'isabelle_sovereign'
        });
        const targetId = targetRes.data.user.id;

        // 3. Manually insert a story for Isabelle with a YOLO Tag
        // (Simulating the upload confirmation)
        console.log('\n--- Mocking YOLO Tagged Story for Isabelle ---');
        await axios.post(`${BASE_URL}/upload/story`, {
            mediaKey: 'uploads/isabelle/fake-media.jpg',
            mediaType: 'image',
            mood: 'Golden Hour | auto-tag: champagne_bottle',
            location: { lat: 45.5017, lng: -73.5673, name: 'Ritz-Carlton' }
        }, { headers: { Authorization: `Bearer ${targetRes.data.token}` } });

        // 4. Get Whisper as the Tester about Isabelle
        console.log('\n--- Requesting AURUM Whisper about Isabelle ---');
        const whisperRes = await axios.get(`${BASE_URL}/users/isabelle_sovereign/whisper`, authHeaders);
        
        console.log('\n🎯 AURUM Whisper Result:');
        console.log(`"${whisperRes.data.whisper}"`);

        if (whisperRes.data.whisper.includes('champagne_bottle')) {
            console.log('\n🏆 SUCCESS: AURUM saw the champagne! Story Vision is active.');
        } else {
            console.error('\n❌ FAIL: AURUM missed the champagne.');
        }

    } catch (err) {
        console.error('\n❌ TEST CRASHED:', err.response?.data || err.message);
    }
}

runTest();
