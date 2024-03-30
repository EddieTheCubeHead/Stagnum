import os
import random
from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends

from database.entities import PoolMember, User


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
    pseudo_random_floor: int
    pseudo_random_ceiling: int


def _get_members_weight(members: list[PoolMember]) -> int:
    return 1 if members else 0


class PoolRandomizer:

    def __init__(self, pool_members: list[PoolMember], users: list[User],
                 randomization_parameters: RandomizationParameters):
        self._custom_weight_scale = randomization_parameters.custom_weight_scale
        self._users: dict[str, User] = {user.spotify_id: user for user in users}
        self._user_pools: dict[str, [PoolMember]] = {user.spotify_id: [] for user in users}
        self._pool_length = len(pool_members)
        self._pool_length_ms = sum((pool_member.duration_ms for pool_member in pool_members))
        self._concrete_floor = self._pool_length * (randomization_parameters.pseudo_random_floor / 100)
        self._concrete_ceiling = self._pool_length * (randomization_parameters.pseudo_random_ceiling / 100)
        self._slope = 1 / (self._concrete_ceiling - self._concrete_floor)
        self._offset = self._pool_length - self._concrete_floor

        for pool_member in pool_members:
            self._user_pools[pool_member.user_id].append(pool_member)

    def get_next_song(self) -> PoolMember:
        user_id = self._get_next_playing_user_id()
        # user_id = random.choice([user_id for user_id, members in self._user_pools.items() if members])

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

    def _get_next_playing_user_id(self) -> str:
        eligible_user_weights: [(str, float)] = []
        total_eligible_user_weights = 0
        for user_id, members in self._user_pools.items():
            if not _get_members_weight(members):
                continue
            user_weight = self._pool_length_ms / (self._users[user_id].joined_pool.playback_time_ms + 1)
            eligible_user_weights.append((user_id, user_weight))
            total_eligible_user_weights += user_weight

        user_location = total_eligible_user_weights * random.random()

        walker = 0
        for user_id, user_weight in eligible_user_weights:
            walker += user_weight
            if walker >= user_location:
                return user_id


    def _calculate_pool_member_weight(self, pool_member: PoolMember) -> PoolMemberRandomizationData:
        member_weight = pow(self._custom_weight_scale, pool_member.randomization_parameters.weight)
        playback_weight = self._calculate_playback_weight(pool_member.randomization_parameters.skips_since_last_play)
        return PoolMemberRandomizationData(pool_member, member_weight * playback_weight)

    def _calculate_playback_weight(self, skips_since_last_play: int) -> float:
        if skips_since_last_play == 0:
            return 1

        if skips_since_last_play <= self._concrete_floor:
            return 0
        elif skips_since_last_play >= self._concrete_ceiling:
            return 1
        return self._slope * (skips_since_last_play - self._offset)


class NextSongProviderRaw:

    @staticmethod
    def select_next_song(pool_members: list[PoolMember], users: list[User]) -> PoolMember:
        custom_weight_scale = int(os.getenv("CUSTOM_WEIGHT_SCALE", "5"))
        pseudo_random_floor = int(os.getenv("PSEUDO_RANDOM_FLOOR", "60"))
        pseudo_random_ceiling = int(os.getenv("PSEUDO_RANDOM_CEILING", "90"))
        randomization_parameters = RandomizationParameters(custom_weight_scale, pseudo_random_floor,
                                                           pseudo_random_ceiling)
        randomizer = PoolRandomizer(pool_members, users, randomization_parameters)
        return randomizer.get_next_song()


NextSongProvider = Annotated[NextSongProviderRaw, Depends()]
