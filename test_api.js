import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { DOMParser } from 'xmldom';

dotenv.config();

const API_KEY = process.env.VITE_MOLIT_API_KEY;
const LAWD_CD = '11680'; // 강남구
const DEAL_YMD = '202412';

async function testApi() {
    console.log(`Testing API with Key: ${API_KEY ? API_KEY.substring(0, 5) + '...' : 'MISSING'}`);

    const queryParams = new URLSearchParams({
        serviceKey: decodeURIComponent(API_KEY),
        LAWD_CD,
        DEAL_YMD,
        pageNo: 1,
        numOfRows: 10
    }).toString();

    const url = `http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev?${queryParams}`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        console.log('Response Status:', response.status);

        if (text.includes('<item>')) {
            console.log('SUCCESS: API returned items.');
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");
            const items = xmlDoc.getElementsByTagName("item");
            console.log(`Found ${items.length} items.`);
        } else if (text.includes('<resultMsg>')) {
            console.log('API Error Message:', text);
        } else {
            console.log('Unknown Response:', text.substring(0, 200));
        }
    } catch (e) {
        console.error('Fetch Failed:', e.message);
    }
}

testApi();
