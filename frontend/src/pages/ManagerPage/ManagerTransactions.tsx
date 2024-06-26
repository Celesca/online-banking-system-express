import { useEffect, useState } from "react";
import Swal, { SweetAlertIcon } from "sweetalert2";
import axios from "axios";
import TransactionCard from "../../components/TransactionCard";

interface TransactionData {
  transaction_id: number;
  amount: number;
  transaction_date: string;
  transaction_type_name: string;
  update_bank_balance: number;
  Payee: string;
  from_account_id: string;
  to_account_id: string;
}

interface SummaryData {
  transaction_type_id: number;
  transaction_type_name: string;
  transaction_count: number;
}

const ManagerTransactionPage = () => {
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [minData, setMinData] = useState<SummaryData>();
  const [maxData, setMaxData] = useState<SummaryData>();

  const responseSwal = (title: string, text: string, icon: SweetAlertIcon) => {
    return Swal.fire({
      title: title,
      text: text,
      icon: icon,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const queryFrequencySummary = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URI}/api/manager/summary_frequency`
      );
      if (response.data) {
        setMinData(response.data.min[0]);
        setMaxData(response.data.max[0]);
      } else {
        responseSwal("No frequency data found", "", "error");
      }
    } catch (error) {
      console.error("Error fetching frequency data:", error);
      responseSwal("Error", "Failed to fetch frequency data", "error");
    }
  }

  const queryTransactions = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URI}/api/transactions`
      );
      if (response.data.length > 0) {
        setTransactionData(response.data);
      } else {
        setTransactionData([]);
        responseSwal("No transactions found", "", "error");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      responseSwal("Error", "Failed to fetch transactions", "error");
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "Manager") {
      responseSwal("You are not authorized to access this page", "We are redirecting you to the homepage", "error").then(() => {
        window.location.href = "/";
      });
    } else {
      queryTransactions();
      queryFrequencySummary();
    }
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredTransactions = transactionData.filter((transaction) =>
    transaction.transaction_type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.Payee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.from_account_id?.toString().includes(searchTerm) ||
    transaction.to_account_id?.toString().includes(searchTerm)
  );

  return (
    <div className="bg-gradient-to-r from-indigo-500 homepage_container pb-24">
      <div className="flex w-100vw items-center justify-center header-container">
        <h1 className="text-white text-3xl py-6 px-16">All Transactions</h1>
      </div>

      <div className="bg-[#6a79ff] p-8">
        <div className="flex flex-col md:flex-row items-center justify-center">
          <div className="flex flex-col items-center md:items-start md:pl-16">
            <h2 className="text-white text-lg">Min Frequency Transaction</h2>
            <p className="text-white text-sm">Transaction Type: {minData?.transaction_type_name}</p>
            <p className="text-white text-sm">Transaction Count: {minData?.transaction_count}</p>
          </div>
          <div className="flex flex-col items-center md:items-start md:pl-16">
            <h2 className="text-white text-lg">Max Frequency Transaction</h2>
            <p className="text-white text-sm">Transaction Type: {maxData?.transaction_type_name}</p>
            <p className="text-white text-sm">Transaction Count: {maxData?.transaction_count}</p>
          </div>
        </div>
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
            placeholder="Search Transactions ..."
            required
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </form>

      {/* Display the Transactions */}
      <div className="flex flex-col">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction, index) => (
            <TransactionCard key={index} transaction={transaction} />
          ))
        ) : (
          <div className="bg-[#7b68ca]">
            <h1 className="text-white text-center p-8 text-2xl">No transaction data</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerTransactionPage;