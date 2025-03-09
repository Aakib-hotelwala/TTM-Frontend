import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableSortLabel,
  TableRow,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  TextField,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import Autocomplete from "@mui/material/Autocomplete";
import { AuthContext } from "../../context/AuthContext";

const API_BASE_URL = "https://localhost:7073/api";

// Define cache outside to persist across renders
const cache = {};

const useFetchData = (endpoint, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!endpoint) return;

    if (cache[endpoint]) {
      setData(cache[endpoint]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
        const extractedData = response.data?.data || response.data;
        cache[endpoint] = extractedData;
        setData(extractedData);
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        setData([]);
      }
      setLoading(false);
    };

    fetchData();
  }, dependencies);

  return { data, loading };
};

const AssignSubjectTeacher = () => {
  const { auth } = useContext(AuthContext);

  return <div>Assign Subject Teacher</div>;
};

export default AssignSubjectTeacher;
