import SideBar from "../components/Dashboard/SideBar";
const Dashboard = () => {
    return (
        <div className="flex">
            <SideBar />
            <div className="flex-1 p-6 bg-gray-100 min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                {/* Nội dung dashboard khác sẽ được thêm vào đây */}
            </div>
        </div>
    );
}
export default Dashboard;