interface AuthUser {
  id: number;
  role: string;
}
export function useAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    return {
      isAuthenticated: false,
      isAdmin: false,
      user: null,
    };
  }try{
    const payload = JSON.parse(atob(token.split(".")[1])) as AuthUser
    return {
        isAuthenticated:true,
        isAdmin:payload.role==="admin",
        user:payload
    }
        
    
  }catch{
    localStorage.removeItem("token")
    return{
        isAuthenticated:false,
        isAdmin:false,
        user:null
    }
  }
}
