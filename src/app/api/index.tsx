interface ApiResponse {
    message: string;
    message_at: string;
    is_user: boolean;
}

interface ParsedMessage {
    agent_action: string;
    action_details: string;
    parameters: Record<string, any>;
}

const sendRequest = async (message:string): Promise<string | ParsedMessage> => {
    try {
        const solanaApiUrl = "https://solanaaihackathon.onrender.com/api/v1/chat"; // New API endpoint
        const response = await fetch(solanaApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query:message }),
        });
        // Check if the response is successful
        if (!response.ok) {
            return "Failed to connect to Solana API";
        }

        if (!response.ok) {
            return "Failed to connect to Solana API";
        }

        const apiResponse: ParsedMessage = await response.json();
        return  processApiResponse(apiResponse);
    } catch (error) {
        console.error("Error in POST /api/v1/chat route:", error);
        // @ts-ignore
        return new Response(
            JSON.stringify({ error: "Internal Server Error", details: error }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

const processApiResponse = (apiResponse: ParsedMessage): ParsedMessage | string => {
    try {
        const parameters = apiResponse.parameters;
        if ("message" in parameters) {
            return parameters.message;
        } else {
            return apiResponse;
        }
    } catch (error) {
        console.error("Error parsing API response:", error);
        throw new Error("Invalid API response format");
    }
}

export default sendRequest