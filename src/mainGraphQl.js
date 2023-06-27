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
        pauseUntilDate
        showBlerpContent
        onBoardingCompleted
        connectionStatus
        simpleMode
        blacklistedWords
        globalChannelPoints
        blacklistedBlerpUserIds
        blockAllMusic
        mpaaRating
        globalBeetCost
        blastPrice
        volume
        urlKey
        lastUrlKey
        urlChangedAt
        userCooldown
        extensionPaused
        extensionDisabled
        isChatEnabled
        channelPointsTitle
        channelPointsImageCached
        channelCooldownLeft
        userCooldownLeft
        ownerId
        headerImage {
            filename
            original {
                url
            }
        }
        onBoardingModalPartOne
        onBoardingModalPartTwo
        onBoardingModalCompleted
        onBoardingModalDoLater
        beetsDisabled
        channelPointsDisabled
        userObject {
            _id
            username
            profileImage {
                filename
                original {
                    url
                }
            }
            browserSourceUrl
            browserSourceUrlBeta
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
            pauseUntilDate
            showBlerpContent
            onBoardingCompleted
            connectionStatus
            simpleMode
            blacklistedWords
            globalChannelPoints
            blacklistedBlerpUserIds
            blockAllMusic
            mpaaRating
            globalBeetCost
            blastPrice
            volume
            urlKey
            lastUrlKey
            urlChangedAt
            userCooldown
            extensionPaused
            extensionDisabled
            isChatEnabled
            ownerId
            channelCooldownLeft
            channelPointsTitle
            channelPointsImageCached
            channelCooldownLeft
            userCooldownLeft
            headerImage {
                filename
                original {
                    url
                }
            }
            onBoardingModalPartOne
            onBoardingModalPartTwo
            onBoardingModalCompleted
            onBoardingModalDoLater
            beetsDisabled
            channelPointsDisabled
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
        featuredPlatforms
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
        featuredPlatforms
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
            imageUrlCached
            title
            canPlay
        }
        blockedContext(ownerId: $streamerId) {
            _id
            blockerId
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

export const ALL_CONTENT = gql`
    ${BITE_WITH_SOUND_EMOTES}
    query browserExtensionSearchContent(
        $searchTerm: String!
        $page: Int
        $perPage: Int
        $audienceRatings: [AudienceRating]
        $audioDuration: Int
        $streamerId: MongoID
        $analytics: JSON
        $showUserContent: Boolean
    ) {
        browserExtension {
            biteElasticSearch(
                query: $searchTerm
                page: $page
                perPage: $perPage
                audienceRating: $audienceRatings
                optionalAudioDuration: $audioDuration
                analytics: { data: $analytics }
                userId: $streamerId
                viewerSide: true
                showUserContent: $showUserContent
            ) {
                pageInfo {
                    perPage
                    currentPage
                    hasNextPage
                }
                items {
                    ...BiteSoundEmotesFragment
                }
            }
        }
    }
`;

export const GET_FEATURED_LIST_SOUND_EMOTES = gql`
    ${BITE_WITH_SOUND_EMOTES}
    query browserExtensionGetFeaturedBites(
        $page: Int
        $perPage: Int
        $streamerId: MongoID!
        $showSaved: Boolean
        $sortOverride: String
        $searchTerm: String
    ) {
        browserExtension {
            soundEmotesFeaturedContentPagination(
                page: $page
                perPage: $perPage
                userId: $streamerId
                showSavedOnly: $showSaved
                sortOverride: $sortOverride
                searchQuery: $searchTerm
            ) {
                count
                items {
                    _id
                    biteId
                    beetAmount
                    bite {
                        ...BiteSoundEmotesFragment
                    }
                }
                pageInfo {
                    currentPage
                    pageCount
                    itemCount
                    hasNextPage
                }
            }
        }
    }
`;
