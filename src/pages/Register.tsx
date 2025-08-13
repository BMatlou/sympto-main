
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new unified auth page
    navigate('/auth');
  }, [navigate]);

  return null;
};

export default Register;
