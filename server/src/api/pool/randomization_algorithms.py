import os
import random
from dataclasses import dataclass
from typing import Annotated

from database.entities import PoolMember, User
from fastapi import Depends


@dataclass
class PoolMemberRandomizationData:
    pool_member: PoolMember
    weight: float


@dataclass
class UserPoolRandomizationData:
    members: list[PoolMemberRandomizationData]
    total_weight: float


@dataclass
class RandomizationParameters:
    custom_weight_scale: int
    user_weight_scale: int
    pseudo_random_floor: int
    pseudo_random_ceiling: int


def _get_members_weight(members: list[PoolMember]) -> int:
    return 1 if members else 0


# Logic heavy part so here come the comments
class PoolRandomizer:
    def __init__(
        self, pool_members: list[PoolMember], users: list[User], randomization_parameters: RandomizationParameters,
    ) -> None:
        # Custom weight and user playback time based weight both operate on an exponential scale. These two base numbers
        # control the aggressiveness of that exponential scale (base^modifier, modifier [-1,1])
        self._custom_weight_scale = randomization_parameters.custom_weight_scale
        self._user_weight_scale = randomization_parameters.user_weight_scale

        self._users: dict[str, User] = {user.spotify_id: user for user in users}
        self._user_pools: dict[str, [PoolMember]] = {user.spotify_id: [] for user in users}
        self._pool_length = len(pool_members)
        self._pool_length_ms = sum(pool_member.duration_ms for pool_member in pool_members)

        # Pseudo random weighting operates on a floor/ceiling principle, where both are integer percentage values of
        # pool length. Floor is the amount of tracks that need to be played before the track can appear again, while
        # ceiling is when the track weight modifier for being played is 1 again. The transition is linear and is
        # described by the slope and offset calculated here (y = x * slope - offset)
        self._concrete_floor = self._pool_length * (randomization_parameters.pseudo_random_floor / 100)
        self._concrete_ceiling = self._pool_length * (randomization_parameters.pseudo_random_ceiling / 100)
        self._slope = 1 / (self._concrete_ceiling - self._concrete_floor)
        self._offset = self._pool_length - self._concrete_floor

        for pool_member in pool_members:
            self._user_pools[pool_member.user_id].append(pool_member)

    def get_next_song(self) -> PoolMember:
        user_id = self._get_next_playing_user_id()

        user_pool_members: [PoolMemberRandomizationData] = []
        total_member_weight: float = 0
        for pool_member in self._user_pools[user_id]:
            if pool_member.user_id != user_id:
                continue
            if pool_member.content_uri.split(":")[1] != "track":
                continue
            member_data = self._calculate_pool_member_weight(pool_member)
            user_pool_members.append(member_data)
            total_member_weight += member_data.weight

        track_location = total_member_weight * random.random()

        walker = 0
        for user_pool_member in user_pool_members:
            walker += user_pool_member.weight
            if walker >= track_location:
                return user_pool_member.pool_member
        return None

    def _get_next_playing_user_id(self) -> str:
        eligible_user_play_times: [(str, int)] = []
        total_play_time = 0

        for user_id, members in self._user_pools.items():
            if not _get_members_weight(members):
                continue
            user_play_time = self._users[user_id].joined_pool.playback_time_ms
            eligible_user_play_times.append((user_id, user_play_time))
            total_play_time += user_play_time

        total_user_weight = 0
        eligible_user_weights: [(str, float)] = []
        for user_id, user_play_time in eligible_user_play_times:
            user_weight = self._calculate_user_weight(total_play_time, user_play_time)
            total_user_weight += user_weight
            eligible_user_weights.append((user_id, user_weight))

        user_location = total_user_weight * random.random()

        walker = 0
        for user_id, user_weight in eligible_user_weights:
            walker += user_weight
            if walker >= user_location:
                return user_id
        return None

    def _calculate_user_weight(self, total_play_time: int, user_play_time: int) -> float:
        # Always give full weight for users with no play time
        if total_play_time == 0:
            return 1

        # Here we get weight for user playback time. user_play_time / total_play_time will be a fraction in [0, 1]
        user_weight_power_reversed_not_shifted = user_play_time / total_play_time

        # Shifting the fraction 0.5 to the left on the real number line gives us a nice normal distribution centered on
        # 0. The value is now in [-0.5, 5]
        user_weight_power_reversed_shifted = user_weight_power_reversed_not_shifted - 0.5

        # Scaling and reversing the value lets us use it as an exponent modifier for the base we get from environment
        # configs. Reversing is important as we want the users with smaller share of playtime, to get bigger weight.
        # the resulting value is in [-1, 1]
        user_weight_power_shifted = user_weight_power_reversed_shifted * -2

        # Finally we raise the base weight scale to the power of the user weight modifier
        return pow(self._user_weight_scale, user_weight_power_shifted)

    def _calculate_pool_member_weight(self, pool_member: PoolMember) -> PoolMemberRandomizationData:
        member_weight = pow(self._custom_weight_scale, pool_member.randomization_parameters.weight)
        playback_weight = self._calculate_playback_weight(pool_member.randomization_parameters.skips_since_last_play)
        return PoolMemberRandomizationData(pool_member, member_weight * playback_weight)

    def _calculate_playback_weight(self, skips_since_last_play: int) -> float:
        # Skips since last play is set as 0 for songs with no plays
        if skips_since_last_play == 0:
            return 1

        # if skips since last play doesn't fall in the linearly increasing part of the pool percentage, we can just
        # set it to minimum/maximum accordingly
        if skips_since_last_play <= self._concrete_floor:
            return 0
        elif skips_since_last_play >= self._concrete_ceiling:
            return 1

        return self._slope * (skips_since_last_play - self._offset)


class NextSongProviderRaw:
    @staticmethod
    def select_next_song(pool_members: list[PoolMember], users: list[User]) -> PoolMember:
        custom_weight_scale = int(os.getenv("CUSTOM_WEIGHT_SCALE", "5"))
        user_weight_scale = int(os.getenv("USER_WEIGHT_SCALE", "20"))
        pseudo_random_floor = int(os.getenv("PSEUDO_RANDOM_FLOOR", "60"))
        pseudo_random_ceiling = int(os.getenv("PSEUDO_RANDOM_CEILING", "90"))
        randomization_parameters = RandomizationParameters(
            custom_weight_scale, user_weight_scale, pseudo_random_floor, pseudo_random_ceiling,
        )
        randomizer = PoolRandomizer(pool_members, users, randomization_parameters)
        return randomizer.get_next_song()


NextSongProvider = Annotated[NextSongProviderRaw, Depends()]
