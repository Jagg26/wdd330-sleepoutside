const baseURL = import.meta.env.VITE_SERVER_URL;

function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

export default class ExternalServices {
  constructor(category) {
    this.category = category;
  }

  async getData(category) {
    // prefer server API when VITE_SERVER_URL is set
    if (baseURL) {
      const response = await fetch(`${baseURL}products/search/${category}`);
      const data = await convertToJson(response);
      return data.Result;
    }

    // fallback to local JSON files in `/json/{category}.json` (served from public/)
    const path = `/json/${category}.json`;
    const response = await fetch(path);
    const data = await convertToJson(response);
    // local JSON files are assumed to contain the array directly
    return data;
  }

  async findProductById(id) {
    if (baseURL) {
      const response = await fetch(`${baseURL}product/${id}`);
      const data = await convertToJson(response);
      return data.Result;
    }

    // fallback: if a category was provided to the service, search it first
    const category = this.category;
    if (category) {
      const path = `/json/${category}.json`;
      const response = await fetch(path);
      const data = await convertToJson(response);
      return data.find((p) => String(p.Id) === String(id));
    }

    // otherwise, search all known local category files
    const categories = ["tents", "backpacks", "sleeping-bags", "hammocks"];
    for (const cat of categories) {
      try {
        const response = await fetch(`/json/${cat}.json`);
        const data = await convertToJson(response);
        const found = data.find((p) => String(p.Id) === String(id));
        if (found) return found;
      } catch (err) {
        // ignore and continue to next category
      }
    }

    return null;
  }

  async checkout(payload) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };
    return await fetch(`${baseURL}checkout/`, options).then(convertToJson);
  }
}
