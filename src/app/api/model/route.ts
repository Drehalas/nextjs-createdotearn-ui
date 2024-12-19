export async function POST(req: Request) {
    try {
        const { query  } = await req.json();

        if (!query) {
            return new Response(
                JSON.stringify({ error: "The 'query' field is required." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }


    const solanaApiUrl = "https://solanaaihackathon.onrender.com/api/v1/chat"; // New API endpoint

    const response = await fetch(solanaApiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query  }),
    });

    // Check if the response is successful
    if (!response.ok) {
        return new Response(
            JSON.stringify({ error: "Failed to connect to Solana API" }),
            { status: response.status, headers: { "Content-Type": "application/json" } }
        );
    }
    // Create a new ReadableStream from the response body
    const stream = new ReadableStream({
        start(controller) {
            if (!response.body) {
                controller.close();
                return;
            }
            const reader = response.body.getReader();

            function pump() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        controller.close();
                        return;
                    }
                    // Enqueue the chunk of data to the controller
                    controller.enqueue(value);
                    pump();
                }).catch(error => {
                    console.error("Error reading response body:", error);
                    controller.error(error);
                });
            }

            pump();
        }
    });

    // Set response headers and return the stream
    const headers = new Headers(response.headers);
    headers.set("Content-Type", "application/json");
    return new Response(stream, { headers });
    }catch (error) {
        console.error("Error in POST /api/v1/chat route:", error);
        // @ts-ignore
        return new Response(
            JSON.stringify({ error: "Internal Server Error", details: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
