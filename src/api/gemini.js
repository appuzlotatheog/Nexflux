// Groq AI API Utility for Cinema Chat
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Cinema Expert System Prompt
const SYSTEM_PROMPT = `You are CineBot 🎬, an elite cinema expert and passionate film enthusiast embedded in Nexflux, a premium streaming platform.

## Your Personality
- Warm, engaging, and genuinely passionate about cinema
- Knowledgeable but never pretentious - you make film discussion accessible
- You use occasional film references and cinema terminology naturally
- You're enthusiastic about both blockbusters and hidden gems
- Concise responses (2-4 sentences typically, longer only when needed)

## Your Expertise
- Deep knowledge of movies and TV shows across all genres and eras
- Understanding of directors, actors, cinematographers, and their signature styles
- Awareness of film history, movements (French New Wave, Italian Neorealism, etc.)
- Knowledge of streaming trends, what's popular, award winners

## CRITICAL: Cinema Markers
When recommending specific movies or TV shows, you MUST wrap each title in special markers like this:
[[CINEMA:Movie Title]] or [[CINEMA:TV Show Title]]

This allows users to play content directly from the chat!

Examples:
- "You should watch [[CINEMA:Inception]] - it's mind-bending!"
- "Try [[CINEMA:Breaking Bad]] for intense drama or [[CINEMA:The Office]] for comedy"
- "I recommend [[CINEMA:Oppenheimer]], [[CINEMA:Barbie]], and [[CINEMA:Dune Part Two]]"

ALWAYS use these markers for ANY movie or TV show you mention. Never skip the markers!

## Response Guidelines
- Keep responses concise and scannable
- Use emojis sparingly but effectively (🎬 🍿 ⭐ 🎭 🔥)
- Always be ready with 2-3 specific recommendations when asked (use markers!)
- When recommending, briefly explain WHY it fits their taste
- Ask follow-up questions to refine recommendations
- If discussing plot details, warn about spoilers first

## Example Interactions
User: "I loved Breaking Bad, what should I watch next?"
CineBot: "Great taste! 🔥 Since you loved Breaking Bad's intensity, try:
• [[CINEMA:Better Call Saul]] - The brilliant prequel
• [[CINEMA:Ozark]] - Family crime drama with similar tension
• [[CINEMA:The Wire]] - Often called the greatest TV ever

What draws you more - the crime aspect or the character transformation?"

User: "Recommend some sci-fi movies"
CineBot: "Here are some must-watch sci-fi films! 🚀
• [[CINEMA:Interstellar]] - Epic space journey with emotional depth
• [[CINEMA:Blade Runner 2049]] - Visually stunning and thought-provoking
• [[CINEMA:Arrival]] - Intelligent and emotionally powerful

Want more action-heavy or cerebral sci-fi?"

Remember: You're here to enhance their cinema journey. ALWAYS use [[CINEMA:title]] markers for recommendations!`;

/**
 * Send a message to Groq API and get a response
 * @param {Array} messages - Chat history [{role: 'user'|'assistant', content: string}]
 * @returns {Promise<string>} - AI response
 */
export const sendMessage = async (messages) => {
    if (!GROQ_API_KEY) {
        console.error('Groq API key not found');
        throw new Error('Groq API key not configured. Please set VITE_GROQ_API_KEY in your .env file');
    }

    // Build messages array for OpenAI-compatible API
    const chatMessages = [
        { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add user messages (skip welcome/intro messages from assistant)
    const filteredMessages = messages.filter(msg => msg.role === 'user' || msg.role === 'assistant');
    const firstUserIndex = filteredMessages.findIndex(msg => msg.role === 'user');

    if (firstUserIndex >= 0) {
        filteredMessages.slice(firstUserIndex).forEach(msg => {
            chatMessages.push({
                role: msg.role,
                content: msg.content
            });
        });
    }

    const requestBody = {
        model: 'llama-3.3-70b-versatile',
        messages: chatMessages,
        temperature: 0.8,
        max_tokens: 1024,
        top_p: 0.95,
    };

    console.log('Sending to Groq:', requestBody.messages.length, 'messages');

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Groq API error:', data);
            throw new Error(data.error?.message || 'Failed to get response from Groq');
        }

        // Extract the text from the response
        const textContent = data.choices?.[0]?.message?.content;
        if (!textContent) {
            console.error('No text content in response:', data);
            throw new Error('No response generated');
        }

        return textContent;
    } catch (error) {
        console.error('Groq API error:', error);
        throw error;
    }
};


/**
 * Get quick suggestions based on context
 */
export const getQuickSuggestions = () => [
    "What should I watch tonight? 🍿",
    "Recommend something like Breaking Bad",
    "Best movies of 2024?",
    "I'm in the mood for a thriller",
    "Hidden gems on streaming?",
];

/**
 * Extract cinema markers from AI response
 * @param {string} text - AI response text
 * @returns {Object} - { titles: string[], cleanText: string }
 */
export const extractCinemaMarkers = (text) => {
    const markerRegex = /\[\[CINEMA:([^\]]+)\]\]/g;
    const titles = [];
    let match;

    while ((match = markerRegex.exec(text)) !== null) {
        titles.push(match[1].trim());
    }

    // Clean the text by removing the markers but keeping the title
    const cleanText = text.replace(markerRegex, '**$1**');

    return { titles: [...new Set(titles)], cleanText }; // Remove duplicates
};

/**
 * Intelligent Search - Parse natural language query into TMDB search parameters
 * @param {string} query - Natural language query like "funny movies with dogs"
 * @returns {Promise<Object>} - { searchTerms: string[], genres: number[], year: string, mediaType: string, suggestions: string[] }
 */
export const intelligentSearch = async (query) => {
    if (!GROQ_API_KEY) {
        throw new Error('Groq API key not configured');
    }

    const searchPrompt = `You are a movie/TV search assistant. Parse this natural language query and extract search parameters.

Query: "${query}"

Respond ONLY with valid JSON (no markdown, no code blocks), in this exact format:
{
    "searchTerms": ["keyword1", "keyword2"],
    "genres": [28, 35],
    "yearFrom": "2020",
    "yearTo": "2024",
    "mediaType": "movie",
    "mood": "funny",
    "suggestions": ["Title 1", "Title 2", "Title 3"]
}

Genre IDs to use:
- Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80
- Documentary: 99, Drama: 18, Family: 10751, Fantasy: 14, History: 36
- Horror: 27, Music: 10402, Mystery: 9648, Romance: 10749, Sci-Fi: 878
- Thriller: 53, War: 10752, Western: 37

Rules:
- searchTerms: Key words from the query (actors, themes, etc.)
- genres: Array of genre IDs that match the query
- yearFrom/yearTo: Year range if mentioned, otherwise null
- mediaType: "movie", "tv", or "all"
- mood: The emotional vibe requested (funny, scary, romantic, etc.)
- suggestions: 3-5 specific movie/TV titles that match the query`;

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that responds only with valid JSON.' },
                    { role: 'user', content: searchPrompt }
                ],
                temperature: 0.3,
                max_tokens: 512,
            })
        });

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '{}';

        // Clean the response - remove markdown code blocks if present
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        try {
            return JSON.parse(cleanedText);
        } catch {
            return { searchTerms: [query], genres: [], mediaType: 'all', suggestions: [] };
        }
    } catch (error) {
        console.error('Intelligent search error:', error);
        return { searchTerms: [query], genres: [], mediaType: 'all', suggestions: [] };
    }
};

/**
 * Predict how well a user will like content based on their watch history
 * @param {Object} content - The content to predict for
 * @param {Array} watchHistory - User's watch history
 * @returns {Promise<Object>} - { matchPercentage: number, reasons: string[] }
 */
export const getMatchPrediction = async (content, watchHistory) => {
    if (!GROQ_API_KEY || !watchHistory?.length) {
        // Return a default based on popularity if no history
        return {
            matchPercentage: Math.min(95, Math.round(content.vote_average * 10)),
            reasons: ['Popular with viewers']
        };
    }

    const historyTitles = watchHistory.slice(0, 10).map(h => h.title).join(', ');
    const contentGenres = content.genre_ids?.join(', ') || content.genres?.map(g => g.name).join(', ') || '';

    const prompt = `Based on a user who watched: ${historyTitles}

Predict how well they'll like: "${content.title || content.name}" (${contentGenres})

Respond ONLY with JSON (no markdown):
{
    "matchPercentage": 85,
    "reasons": ["Similar genre to X you loved", "From director you enjoy"]
}

matchPercentage: 0-100 how likely they'll enjoy it
reasons: 2-3 short reasons why`;

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'Respond only with valid JSON, no markdown.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 256,
            })
        });

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '{}';
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        try {
            return JSON.parse(cleanedText);
        } catch {
            return { matchPercentage: 75, reasons: ['Trending content'] };
        }
    } catch (error) {
        console.error('Match prediction error:', error);
        return { matchPercentage: 75, reasons: ['Trending content'] };
    }
};

/**
 * Generate explanation for why content was recommended
 * @param {Object} content - The recommended content
 * @param {Array} watchHistory - User's watch history
 * @returns {Promise<string>} - Explanation text
 */
export const getRecommendationExplanation = async (content, watchHistory) => {
    if (!GROQ_API_KEY || !watchHistory?.length) {
        return "This is trending and highly rated by viewers like you.";
    }

    const historyTitles = watchHistory.slice(0, 5).map(h => h.title).join(', ');

    const prompt = `User watched: ${historyTitles}

In 1-2 sentences, explain why they might enjoy "${content.title || content.name}". Be specific and reference their history. Keep it concise and engaging.`;

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 100,
            })
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Recommended based on your viewing history.";
    } catch (error) {
        console.error('Recommendation explanation error:', error);
        return "Recommended based on your viewing history.";
    }
};

