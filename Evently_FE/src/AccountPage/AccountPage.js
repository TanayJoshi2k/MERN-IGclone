import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { emitFollowNotification } from "../Services/Socket";
import Navbar from "../Navbar/Navbar";
import Heart from "../Logos/Heart";
import HoverComment from "../Assets/comment_hover.png";
import axios from "axios";
import classes from "./AccountPage.module.css";
import { saveUserDetails, setNotification } from "../redux/actions/userActions";
import { motion } from "framer-motion";

function AccountPage() {
  const state = useSelector((state) => state);
  const dispatch = useDispatch();
  const params = useParams();
  const [username, _] = useState(params.username);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    followersCount: 0,
    followingCount: 0,
    posts: [],
    avatar: "",
  });

  useEffect(() => {
    axios
      .get(`/account/${username}`)
      .then((res) => {
        setUserData({
          firstName: res.data.userDetails.firstName,
          lastName: res.data.userDetails.lastName,
          bio: res.data.userDetails.bio,
          followersCount: res.data.userDetails.followers.length,
          followingCount: res.data.userDetails.following.length,
          posts: res.data.posts,
          avatar: res.data.userDetails.avatarURL,
        });
      })
      .catch((e) => {
        console.log(e);
      });
  }, [params, username, state.userReducer.following]);

  const followHandler = () => {
    emitFollowNotification(username, state.userReducer.username);
    axios
      .put(`/account/follow/${username}`, {
        username: state.userReducer.username,
      })
      .then((res) => {
        dispatch(saveUserDetails({ following: res.data.following }));
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const unfollowHandler = () => {
    axios
      .put(`/account/unfollow/${username}`, {
        username: state.userReducer.username,
      })
      .then((res) => {
        dispatch(saveUserDetails({ following: res.data.following }));
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />
      <div className={classes.accountPageContainer}>
        <div className={classes.heroBanner}>
          <div className={classes.profilePicContainer}>
            <img src={userData.avatar} alt="Profile Pic" />
            <p>{username}</p>
          </div>
          <div className={classes.meta}>
            <h2>{userData.firstName + " " + userData.lastName}</h2>
            <p className={classes.bio}>{userData.bio}</p>
            <div>
              <p>
                <span>{userData.posts.length}</span>Posts
              </p>
              <p>
                <span>{userData.followersCount}</span>Followers
              </p>
              <p>
                <span>{userData.followingCount}</span>Following
              </p>
            </div>
            {state.userReducer.username !== username &&
            !state.userReducer.following.includes(username) ? (
              <button className={classes.followBtn} onClick={followHandler}>
                Follow
              </button>
            ) : null}
            {state.userReducer.username !== username &&
            state.userReducer.following.includes(username) ? (
              <button className={classes.followBtn} onClick={unfollowHandler}>
                Unfollow
              </button>
            ) : null}
          </div>
        </div>
        <div className={classes.postsContainer}>
          {userData.posts.map((post) => (
            <div className={classes.post}>
              <img src={post.postURL} alt="" />
              <div className={classes.postInfoOverlay}>
                <div>
                  <Heart fillColor={"white"} width={20} height={20} />
                  <span>{post.likes}</span>
                </div>
                <div>
                  <img src={HoverComment} alt="..." />
                  <span>{post.comments?.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default AccountPage;
