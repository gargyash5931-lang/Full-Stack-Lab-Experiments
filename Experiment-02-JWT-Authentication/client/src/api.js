const API_URL = "http://localhost:5000/api";

export async function apiRequest(
  endpoint,
  options = {}
) {

  const token =
    localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json"
  };

  if (options.headers) {
    Object.assign(
      headers,
      options.headers
    );
  }

  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  console.log(
    "API REQUEST:",
    endpoint,
    options.body
  );


  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers
      }
    );


  const data =
    await response
      .json()
      .catch(
        () => ({})
      );


  console.log(
    "API RESPONSE:",
    endpoint,
    data
  );


  if (!response.ok) {

    throw new Error(
      data.message ||
      "Request failed"
    );

  }


  return data;

}