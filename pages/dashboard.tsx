// pages/dashboard.tsx
import { GetServerSideProps } from "next";

export default function Dashboard() {
  return <div>Welcome to your dashboard!</div>;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req, res } = ctx;
  const cookie = req.cookies["token"];
  if (!cookie) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  // You can validate the token / session here
  return { props: {} };
};
