export async function handler(event) {
  try {
    // Read data from frontend
    const data = JSON.parse(event.body);

    // Call Google Apps Script (Workspace)
    const response = await fetch(
      "https://script.google.com/a/macros/zeptonow.com/s/AKfycbxlbE46iLOqnZNAIAMOdbGAWy1k3YWjaVW52lMhnoCVofaV6eASsBdjk4GD_IcMQbfx5Q/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }
    );

    const result = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: result
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
