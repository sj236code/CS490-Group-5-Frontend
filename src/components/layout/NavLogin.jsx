function NavLogin({ onClick, style }) {
  return (
    <div onClick={onClick} className="sign-in-button-nav" style={style}>
      Sign In / Sign Up
    </div>
  );
}

export default NavLogin;
