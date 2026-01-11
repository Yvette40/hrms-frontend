function Layout() {
  return (
    <>
      <Navbar />
      <div className="page-content">
        <Outlet />
      </div>
    </>
  );
}
