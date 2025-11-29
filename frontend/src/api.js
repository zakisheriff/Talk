const API_URL = "http://localhost:8000";

export const chatStream = async (message, history, onChunk) => {
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message, history }),
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            onChunk(chunk);
        }
    } catch (error) {
        console.error("Error chatting:", error);
        onChunk("Error connecting to server.");
    }
};

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: "POST",
            body: formData,
        });
        return await response.json();
    } catch (error) {
        console.error("Error uploading:", error);
        return { message: "Error uploading file." };
    }
};

export const checkHealth = async () => {
    try {
        const response = await fetch(`${API_URL}/`);
        return response.ok;
    } catch (error) {
        return false;
    }
};
