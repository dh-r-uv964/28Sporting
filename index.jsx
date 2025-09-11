import Layout from "./Layout.jsx";

import Welcome from "./Welcome";

import Onboarding from "./Onboarding";

import LocationSetup from "./LocationSetup";

import Dashboard from "./Dashboard";

import GolfVenues from "./GolfVenues";

import TennisVenues from "./TennisVenues";

import PickleballVenues from "./PickleballVenues";

import VenueSearch from "./VenueSearch";

import PartnerFinder from "./PartnerFinder";

import MyMatches from "./MyMatches";

import CreatePartnerRequest from "./CreatePartnerRequest";

import Settings from "./Settings";

import AboutUs from "./AboutUs";

import Legal from "./Legal";

import BoxingVenues from "./BoxingVenues";

import BasketballVenues from "./BasketballVenues";

import Subscriptions from "./Subscriptions";

import SwimmingVenues from "./SwimmingVenues";

import HikingVenues from "./HikingVenues";

import FitnessVenues from "./FitnessVenues";

import Groups from "./Groups";

import GroupDetails from "./GroupDetails";

import ProfileSetup from "./ProfileSetup";

import VenueDetails from "./VenueDetails";

import Notifications from "./Notifications";

import Checkout from "./Checkout";

import Chat from "./Chat";

import PadelTennisVenues from "./PadelTennisVenues";

import AIBot from "./AIBot";

import VenueBooking from "./VenueBooking";

import DevTools from "./DevTools";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Welcome: Welcome,
    
    Onboarding: Onboarding,
    
    LocationSetup: LocationSetup,
    
    Dashboard: Dashboard,
    
    GolfVenues: GolfVenues,
    
    TennisVenues: TennisVenues,
    
    PickleballVenues: PickleballVenues,
    
    VenueSearch: VenueSearch,
    
    PartnerFinder: PartnerFinder,
    
    MyMatches: MyMatches,
    
    CreatePartnerRequest: CreatePartnerRequest,
    
    Settings: Settings,
    
    AboutUs: AboutUs,
    
    Legal: Legal,
    
    BoxingVenues: BoxingVenues,
    
    BasketballVenues: BasketballVenues,
    
    Subscriptions: Subscriptions,
    
    SwimmingVenues: SwimmingVenues,
    
    HikingVenues: HikingVenues,
    
    FitnessVenues: FitnessVenues,
    
    Groups: Groups,
    
    GroupDetails: GroupDetails,
    
    ProfileSetup: ProfileSetup,
    
    VenueDetails: VenueDetails,
    
    Notifications: Notifications,
    
    Checkout: Checkout,
    
    Chat: Chat,
    
    PadelTennisVenues: PadelTennisVenues,
    
    AIBot: AIBot,
    
    VenueBooking: VenueBooking,
    
    DevTools: DevTools,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Welcome />} />
                
                
                <Route path="/Welcome" element={<Welcome />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/LocationSetup" element={<LocationSetup />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/GolfVenues" element={<GolfVenues />} />
                
                <Route path="/TennisVenues" element={<TennisVenues />} />
                
                <Route path="/PickleballVenues" element={<PickleballVenues />} />
                
                <Route path="/VenueSearch" element={<VenueSearch />} />
                
                <Route path="/PartnerFinder" element={<PartnerFinder />} />
                
                <Route path="/MyMatches" element={<MyMatches />} />
                
                <Route path="/CreatePartnerRequest" element={<CreatePartnerRequest />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/AboutUs" element={<AboutUs />} />
                
                <Route path="/Legal" element={<Legal />} />
                
                <Route path="/BoxingVenues" element={<BoxingVenues />} />
                
                <Route path="/BasketballVenues" element={<BasketballVenues />} />
                
                <Route path="/Subscriptions" element={<Subscriptions />} />
                
                <Route path="/SwimmingVenues" element={<SwimmingVenues />} />
                
                <Route path="/HikingVenues" element={<HikingVenues />} />
                
                <Route path="/FitnessVenues" element={<FitnessVenues />} />
                
                <Route path="/Groups" element={<Groups />} />
                
                <Route path="/GroupDetails" element={<GroupDetails />} />
                
                <Route path="/ProfileSetup" element={<ProfileSetup />} />
                
                <Route path="/VenueDetails" element={<VenueDetails />} />
                
                <Route path="/Notifications" element={<Notifications />} />
                
                <Route path="/Checkout" element={<Checkout />} />
                
                <Route path="/Chat" element={<Chat />} />
                
                <Route path="/PadelTennisVenues" element={<PadelTennisVenues />} />
                
                <Route path="/AIBot" element={<AIBot />} />
                
                <Route path="/VenueBooking" element={<VenueBooking />} />
                
                <Route path="/DevTools" element={<DevTools />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}