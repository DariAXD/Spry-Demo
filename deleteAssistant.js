import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const client = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY']
});

async function deleteAssistant() {
    try {
        const assistants = await client.beta.assistants.list();
        const nutritionistAssistant = assistants.data.find(a => a.name === "AI Nutritionist");
        
        if (nutritionistAssistant) {
            await client.beta.assistants.del(nutritionistAssistant.id);
            console.log('Successfully deleted AI Nutritionist assistant');
        } else {
            console.log('No AI Nutritionist assistant found to delete');
        }
    } catch (error) {
        console.error('Error deleting assistant:', error);
    }
}

deleteAssistant(); 