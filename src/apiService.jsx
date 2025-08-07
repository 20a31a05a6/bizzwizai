const BaseUrl = "http://127.0.0.1:8000/api";

// Flag to prevent multiple redirects
let isRedirecting = false;

const ApiService = async (endpoint, method, data = null, isFormData = false, token = null) => {
  try {
    // If no token provided, get from localStorage
    const authToken = token || localStorage.getItem("bizwizusertoken");
    
    const options = {
      method,
      headers: {
        Accept: "application/json",
        ...(authToken && {
          Authorization: `Bearer ${authToken}`,
        }),
      },
    };

    if (!isFormData) {
      options.headers["Content-Type"] = "application/json";
    }

    if (method !== "GET" && data) {
      options.body = isFormData ? data : JSON.stringify(data);
    }

    const response = await fetch(`${BaseUrl}${endpoint}`, options);
    const responseData = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        handleAuthError();
        throw { response: { status: 401, data: responseData } };
      }

      if (responseData.errors) {
        throw {
          response: { status: response.status, data: responseData },
          message: responseData.message || "Validation failed",
        };
      }

      throw {
        response: { status: response.status, data: responseData },
        message: responseData.message || "Something went wrong!",
      };
    }

    return responseData;
  } catch (error) {
    if (error.response) {
      throw error;
    }

    if (error.message === "Failed to fetch") {
      throw new Error("Network error, please check your internet connection.");
    }

    throw new Error(error.message || "An unexpected error occurred");
  }
};

// Function to handle authentication errors
function handleAuthError() {
  if (!isRedirecting) {
    isRedirecting = true;
    localStorage.removeItem("bizwizusertoken");
    localStorage.removeItem("bizzwiz-userRole");
    localStorage.removeItem("bizzwiz-userId");
    window.location.href = "/login";
    setTimeout(() => {
      isRedirecting = false;
    }, 5000);
  }
}

export default ApiService;
