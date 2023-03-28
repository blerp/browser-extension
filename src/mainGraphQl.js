import gql from "graphql-tag";

export const UPDATE_VIEWER_LOG = gql`
    mutation updateViewerLog($channelOwnerId: MongoID!) {
        browserExtension {
            updateViewerLog(channelOwnerId: $channelOwnerId) {
                channelPointsBasket {
                    _id
                    points
                    lastIncrementedAt
                    showManualButton
                    manualMS
                    standardMS
                    lastViewedAt
                }
                pointsIncremented
            }
        }
    }
`;
export const EARN_SNOOT_POINTS = gql`
    mutation earnSomeSnoots($channelOwnerId: MongoID!, $manualEarn: Boolean) {
        browserExtension {
            earningSnoots(
                channelOwnerId: $channelOwnerId
                manualEarn: $manualEarn
            ) {
                channelPointsBasket {
                    _id
                    points
                    lastIncrementedAt
                    showManualButton
                    manualMS
                    standardMS
                    lastViewedAt
                }
                pointsIncremented
            }
        }
    }
`;

export const BLERP_USER_SELF = gql`
    fragment UserFragment on User {
        _id
        username
        profileImage {
            filename
            original {
                url
            }
        }
        soundEmotesStreamerId
        twitchChannelId
        twitchSubscription {
            _id
            type
            status
            endDate
            isActiveSubscription
            plan {
                _id
                type
            }
        }
        userWallet {
            _id
            beetBalance
            creatorBalance
        }
    }
`;

export const SOUND_EMOTES_STREAMER = gql`
    fragment SoundEmotesStreamerFragment on SoundEmotesStreamer {
        _id
        channelCooldown
        onboardingLink
        onboardingEnded
        onboardingStarted
        onboardingContent
        onboardingExtension
        onboardingBrowserSource
        roomId
        onBoardingCompleted
        connectionStatus
        simpleMode
        blacklistedWords
        blacklistedBlerpUserIds
        blockAllMusic
        mpaaRating
        globalBeetCost
        globalChannelPoints
        blastPrice
        volume
        urlKey
        lastUrlKey
        urlChangedAt
        userCooldown
        extensionPaused
        isChatEnabled
        userCooldownLeft
        channelCooldownLeft
        channelPointsDisabled
        beetsDisabled
        ownerId
        headerImage {
            filename
            original {
                url
            }
        }
        userObject {
            _id
            username
            profileImage {
                filename
                original {
                    url
                }
            }
            soundEmotesStreamerId
            twitchChannelId
            editorPermissionOnThisUser
            twitchSubscription {
                _id
                type
                status
                endDate
                isActiveSubscription
                plan {
                    _id
                    type
                }
            }
            loggedInChannelPointBasket {
                _id
                ownerId
                points
                lastIncrementedAt
                createdAt
                showManualButton
                manualMS
                lastViewedAt
                standardMS
            }
        }

        customChatMessage
        customChatMessage
        customImageSetting
        customSettingsEnabled
        hideCustomSpeaker
        customAlertColor
        customColor
        customLogoImageId
        customLogoCachedUrl
        customBackgroundColorExtension
        customFontColor
        customBackgroundColor
        customBackgroundUrl
        customBackgroundImageSetting
        accentColor
        customThemeSetting
    }
`;

export const BLERP_USER_STREAMER = gql`
    fragment BlerpStreamerFragment on User {
        _id
        username
        userLanguage
        twitchChannelId
        youtubeChannelId
        browserOnline

        profileType
        accountStatus
        twitchUsernameLogin

        loggedInUserIsBlocked

        soundEmotesObject {
            _id
            channelCooldown
            onboardingLink
            onboardingEnded
            onboardingStarted
            onboardingContent
            onboardingExtension
            onboardingBrowserSource
            roomId
            onBoardingCompleted
            connectionStatus
            simpleMode
            blacklistedWords
            blacklistedBlerpUserIds
            blockAllMusic
            mpaaRating
            globalBeetCost
            globalChannelPoints
            blastPrice
            volume
            urlKey
            lastUrlKey
            urlChangedAt
            userCooldown
            extensionPaused
            isChatEnabled
            ownerId
            channelPointsTitle
            channelPointsImageCached
            channelCooldownLeft
            userCooldownLeft
            channelPointsDisabled
            beetsDisabled
        }

        profileImage {
            filename
            original {
                url
            }
        }
        twitchChannelId
        youtubeChannelId
        googleId
        discordId
        twitchId
        followerCount
        followingCount
        hyperWalletActive
        crmContactId
        roles
        socialLinks {
            _id
            name
            link
        }

        soundEmotesStreamerId
        twitchChannelId
        editorPermissionOnThisUser
        twitchSubscription {
            _id
            type
            status
            endDate
            isActiveSubscription
            plan {
                _id
                type
            }
        }

        loggedInChannelPointBasket {
            _id
            ownerId
            points
            lastIncrementedAt
            createdAt
            showManualButton
            manualMS
            standardMS
            lastViewedAt
        }
    }
`;

export const BITE = gql`
    fragment BiteFragment on Bite {
        _id
        title
        image {
            filename
            original {
                url
            }
        }
        audio {
            filename
            mp3 {
                url
            }
        }
        bitPrice
        topReactions
        totalSaveCount
        saved
        ownerId
        strictAudienceRating
        audienceRating
        isPremium
        pinned
        audioDuration
        owned
        streamerOwnsBite
        visibility
        redactionType
        walkOnContext {
            _id
            approval
            channelId
            viewerId
            approval
        }
        whitelistContext {
            _id
            biteId
            bitPrice
            subTier
            whitelisted
        }
        blacklistContext {
            _id
            biteId
        }
        suggestionContext {
            _id
            biteId
            approvalState
            reviewed
            reviewer {
                _id
                username
            }
            submitter {
                _id
                username
                twitchChannelId
                twitchUserInfo {
                    _id
                    id
                }
            }
        }
        channelPointsContext {
            _id
            biteId
            cost
        }

        userReactions {
            _id
            reactions
            createdAt
        }
        ownerObject {
            _id
            username
            profileImage {
                filename
                original {
                    url
                }
            }
        }
    }
`;

export const BITE_WITH_SOUND_EMOTES = gql`
    fragment BiteSoundEmotesFragment on Bite {
        _id
        title
        image {
            filename
            original {
                url
            }
        }
        audio {
            filename
            mp3 {
                url
            }
        }
        bitPrice
        topReactions
        totalSaveCount
        saved
        ownerId
        strictAudienceRating
        audienceRating
        isPremium
        pinned
        audioDuration
        owned
        streamerOwnsBite
        visibility
        redactionType
        newAudienceRating
        soundEmotesContext(ownerId: $streamerId) {
            _id
            visibility
            beetPrice
            beetAmount
            color
            gain
            channelPointsAmount
            playType
            channelPointsDisabled
            beetsDisabled
            hasAdded
            addedAt
        }
        walkOnContext {
            _id
            approval
            channelId
            viewerId
            approval
        }
        whitelistContext {
            _id
            biteId
            bitPrice
            subTier
            whitelisted
        }
        blacklistContext {
            _id
            biteId
        }
        suggestionContext {
            _id
            biteId
            approvalState
            reviewed
            reviewer {
                _id
                username
            }
            submitter {
                _id
                username
                twitchChannelId
                twitchUserInfo {
                    _id
                    id
                }
            }
        }
        channelPointsContext {
            _id
            biteId
            cost
        }

        userReactions {
            _id
            reactions
            createdAt
        }
        ownerObject {
            _id
            username
            profileImage {
                filename
                original {
                    url
                }
            }
        }
    }
`;
