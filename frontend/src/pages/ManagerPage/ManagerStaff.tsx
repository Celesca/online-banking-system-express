import axios from "axios";
import { useEffect, useState } from "react";
import Swal, { SweetAlertIcon } from "sweetalert2";
import "./Manager.css";
import ManagerStaffCard from "../../components/ManagerComponent/ManagerStaffCard";
import { StaffInfoData } from "../../model/StaffInfoData";

const ManagerStaff = () => {
  const [staffData, setStaffData] = useState<StaffInfoData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

const handleDelete = async (email: string) => {
    // Call your backend API to delete the customer using accountId
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {

        try {
          // Example of delete request
          const uri = `${import.meta.env.VITE_SERVER_URI}/api/staffs/${email}`;
          await axios.delete(uri);
    
          responseSwal("Success", "Customer deleted successfully", "success");
    
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (error) {
    
          responseSwal("Error", "Failed to delete customer", "error");
        }
      }
      }
    )
  }

  const filteredStaffs = staffData.filter((staff) =>
    staff.first_name.includes(searchTerm) ||
    staff.last_name.includes(searchTerm) ||
    staff.email.includes(searchTerm) ||
    staff.national_card_id.includes(searchTerm)
  );

  const queryStaff = async () => {
    const uri =
      import.meta.env.VITE_SERVER_URI + "/api/staffs";
    const response = await axios.get(uri);
    console.log(response.data.staffs);
    setStaffData(response.data.staffs);
  };

  const responseSwal = async (
    title: string,
    text: string,
    icon: SweetAlertIcon
  ) => {
    const swal = await import("sweetalert2");
    return swal.default.fire({
      title: title,
      text: text,
      icon: icon,
      confirmButtonColor: "#00ab55",
      timer: 1500,
    });
  };

  const handleClickCard = (staff_email: string) => {
    window.location.href = "/manager/staffs/" + staff_email;
}

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "Manager") {
      responseSwal(
        "You are not authorized to access this page",
        "We are redirecting you to the homepage",
        "error"
      ).then(() => {
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      });
    }
    queryStaff();
    
  }, []);


  return (
    <div className="homepage_container pb-24">
      <div className="flex w-100vw header-container">
        <h1 className="text-white text-3xl py-6 px-16">Staff List</h1>
      </div>

      <form className="max-w-md mx-auto mt-8">
        <label
          htmlFor="default-search"
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search Staffs ..."
            required
            value={searchTerm}
            onChange={handleSearchChange}
          />
        
        </div>
      </form>
      <div className="flex justify-center">
        <div className="w-2/5 p-4">
          {filteredStaffs.map((staff, index) => (
            <ManagerStaffCard
              key={index}
              staff={staff}
              onClickCard={handleClickCard}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerStaff;
