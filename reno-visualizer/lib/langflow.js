export async function callLangflowAgent(agentEndpoint, payload, apiKey, apiUrl) {
    const res = await fetch(`${apiUrl}${agentEndpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    return res.json();
  }