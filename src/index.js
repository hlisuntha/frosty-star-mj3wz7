import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  TextField,
  Container,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { MuiTelInput, isValidPhoneNumber } from "mui-tel-input";
import { GoogleButton } from "react-google-button";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";
import "yup-phone";

import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { UserAuth } from "../context/AuthContext";
import { UserData } from "../context/DataContext";

const RegistrationForm = ({ handleNext }) => {
  const [courses, setCourses] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const coursesCollectionRef = collection(db, "courses");

  useEffect(() => {
    const getCourses = async () => {
      const data = await getDocs(coursesCollectionRef);
      setCourses(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    getCourses();
  }, []);

  const { googleSignIn, facebookSignIn, user, setUpRecaptcha } = UserAuth();
  const { handleRegistrationData, handleOtpResult } = UserData();

  useEffect(() => {
    setFirstName(user?.displayName?.split(" ")[0]);
    setLastName(user?.displayName?.split(" ")[1]);
    setEmail(user?.email);
  }, [user]);

  const linkedInRegex = "^https:\\/\\/[a-z]{2,3}\\.linkedin\\.com\\/.*$";
  const twitterRegex =
    "(https://twitter.com/(?![a-zA-Z0-9_]+/)([a-zA-Z0-9_]+))";
  const facebookRegex = "((http|https)://)?(www[.])?facebook.com/.+";

  const schema = object({
    fName: string()
      .required("First name is required")
      .min(3, "First name is too short")
      .max(255, "First is too long"),
    mName: string()
      .required("Middle name is required")
      .min(3, "Middle name is too short")
      .max(255, "Middle name is too long"),
    lName: string()
      .required("Last name is required")
      .min(3, "Last name is too short")
      .max(255, "Last name is too long"),
    phone: string()
      .required("Phone number is required")
      .phone("EG", true, "Phone number is invalid"),
    nationalID: string()
      .required("National ID is required")
      .matches(/^[0-9]+$/, "Must be only digits")
      .min(14, "Must be exactly 14 digits")
      .max(14, "Must be exactly 14 digits"),
    email: string()
      .required("Email is required")
      .email("Invalid email address"),
    address1: string()
      .required("Address 1 is required")
      .min(4, "Address is too short"),
    linkedIn: string()
      .required("LinkedIn is required")
      .matches(linkedInRegex, "Must be a valid LinkedIn link"),
    twitter: string()
      .required("Twitter is required")
      .matches(twitterRegex, "Must be a valid Twitter link"),
    facebook: string()
      .required("Facebook is required")
      .matches(facebookRegex, "Must be a valid Facebook link"),
  }).required();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const submitForm = async (data) => {
    handleRegistrationData(data);

    if (phoneNumber !== "" || phoneNumber !== undefined) {
      try {
        const response = await setUpRecaptcha(phoneNumber);
        handleOtpResult(response);
        handleNext();
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (firstName?.length > 3) {
      setValue("fName", firstName);
      errors.fName = null;
    }
  }, [firstName]);

  useEffect(() => {
    if (lastName?.length > 3) {
      setValue("lName", lastName);
      errors.lName = null;
    }
  }, [lastName]);

  useEffect(() => {
    setValue("email", email);
    errors.email = null;
  }, [email]);

  useEffect(() => {
    if (isValidPhoneNumber(phoneNumber)) {
      setValue("phone", phoneNumber);
      errors.phone = null;
    }
  }, [phoneNumber]);

  return (
    <>
      <Container
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: { md: "85%", xs: "95%" },
          mt: 3,
        }}
      >
        <GoogleButton onClick={async () => await googleSignIn()} />

        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: "#0943A2",
            px: "40px",
            borderRadius: "0",
            textTransform: "none",
            fontSize: "16px",
          }}
          onClick={async () => await facebookSignIn()}
        >
          Sign in with Facebook
        </Button>
      </Container>

      <form onSubmit={handleSubmit(submitForm)} autoComplete="off">
        <TextField
          {...register("fName", {
            onChange: (e) => setFirstName(e.target.value),
          })}
          label="First Name"
          variant="standard"
          error={errors.fName ? true : false}
          helperText={errors.fName ? errors.fName.message : ""}
          value={firstName ? firstName : ""}
        />

        <TextField
          {...register("mName")}
          label="Middle Name"
          variant="standard"
          error={errors.mName ? true : false}
          helperText={errors.mName ? errors.mName.message : ""}
        />

        <TextField
          {...register("lName", {
            onChange: (e) => setLastName(e.target.value),
          })}
          label="Last Name"
          variant="standard"
          error={errors.lName ? true : false}
          helperText={errors.lName ? errors.lName.message : ""}
          value={lastName ? lastName : ""}
        />

        <MuiTelInput
          {...register("phone")}
          label="Phone Number"
          variant="standard"
          error={errors.phone ? true : false}
          helperText={errors.phone ? errors.phone.message : ""}
          defaultCountry="EG"
          value={phoneNumber && phoneNumber}
          onChange={(newValue) => setPhoneNumber(newValue)}
        />

        <TextField
          {...register("nationalID")}
          label="National ID"
          variant="standard"
          error={errors.nationalID ? true : false}
          helperText={errors.nationalID ? errors.nationalID.message : ""}
        />

        <TextField
          {...register("email", {
            onChange: (e) => setEmail(e.target.value),
          })}
          label="Email"
          variant="standard"
          error={errors.email ? true : false}
          helperText={errors.email ? errors.email.message : ""}
          type="email"
          value={email ? email : ""}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          {...register("address1")}
          label="Address 1"
          variant="standard"
          error={errors.address1 ? true : false}
          helperText={errors.address1 ? errors.address1.message : ""}
        />

        <TextField
          {...register("address2")}
          label="Address 2"
          variant="standard"
        />

        <TextField
          {...register("linkedIn")}
          label="LinkedIn Profile Link"
          variant="standard"
          error={errors.linkedIn ? true : false}
          helperText={errors.linkedIn ? errors.linkedIn.message : ""}
        />

        <TextField
          {...register("twitter")}
          label="Twitter Profile Link"
          variant="standard"
          error={errors.twitter ? true : false}
          helperText={errors.twitter ? errors.twitter.message : ""}
        />

        <TextField
          {...register("facebook")}
          label="Facebook Profile Link"
          variant="standard"
          error={errors.facebook ? true : false}
          helperText={errors.facebook ? errors.facebook.message : ""}
        />

        {courses && (
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Courses</FormLabel>
            <FormGroup row>
              {courses.map((course) => {
                return (
                  <FormControlLabel
                    key={course.id}
                    value={course.id}
                    control={<Checkbox {...register("courses")} />}
                    label={course.course}
                  />
                );
              })}
            </FormGroup>
          </FormControl>
        )}

        <Button type="submit" variant="contained" sx={{ mt: 2, width: "50%" }}>
          Submit
        </Button>

        <div id="recaptcha-container" />
      </form>
    </>
  );
};

export default RegistrationForm;
