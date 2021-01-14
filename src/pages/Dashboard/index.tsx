import React, { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

import { useTheme } from 'styled-components';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

import moment from 'moment'

import {
  Container,
  Header,
  HeaderTitle,
  UserName,
  ProfileButton,
  UserAvatar,
  ProvidersList,
  ProvidersListTitle,
  ProviderContainer,
  ProviderAvatar,
  ProviderInfo,
  ProviderName,
  ProviderMeta,
  ProviderMetaText,
  HeaderContainer,
  HeaderContainerTitle,
  DatePickerModal,
  DatePickerContainer,
  DatePickerControl,
  DatePickerForeground
} from './styles';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { Alert, Button, Modal, Platform, StyleSheet, Text, TouchableHighlight, View } from 'react-native';

import {Calendar} from 'react-native-calendars'
import { date } from 'yup';

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
  item:any
  avatar:string
}
export interface Appointment {
  id: string;
  provider_id: string;
  user_id: string;
  date:string
  item:any
  user:Provider
}

const Dashboard: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dateNow, setDateNow] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const nonUserImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUI4ueoXqXOfnVlpC3cXaSM9BEuVni-t7qmQ&usqp=CAU"

  const { user,signOut } = useAuth();
  const { navigate } = useNavigation();
  const theme = useTheme();

  useEffect(() => {
    api.get('/providers?key=1').then(response => {
      setProviders(response.data);
    });
  }, [providers]);

  useEffect(()=>{
    setDateNow(moment().format('DD-MM-YYYY'))
    const date = dateNow.split('-')
    

    api.get(`appointments/me?day=${date[0]}&month=${date[1]}&year=${date[1]}`)
    .then(response =>{
      setAppointments(response.data)
    })
  },[dateNow])

  const navigateToProfile = useCallback(() => {
    navigate('Profile');
  }, [navigate]);

  const selectDayForAppointment = useCallback((date) => {
    api.get(`appointments/me?day=${date.day}&month=${date.month}&year=${date.year}`)
    .then(response =>{
      setAppointments(response.data)
      setModalVisible(state => !state)
    })

  },[appointments]);


  return (
    <Container>
      <Header>
        <TouchableOpacity onPress={signOut}>
          <Icon name="power" size={25} color="red" />
        </TouchableOpacity>
        <HeaderTitle>
          Bem vindo,{'\n'}
          <UserName>{user.name}</UserName>
        </HeaderTitle>

        <ProfileButton onPress={navigateToProfile}>
          <UserAvatar source={{ uri: user.avatar_url ? user.avatar_url :nonUserImage }} />
        </ProfileButton>
      </Header>
      <HeaderContainer>
        <HeaderContainerTitle>Agenda</HeaderContainerTitle>
        <TouchableOpacity onPress={()=> setModalVisible(state => !state)}>
          <Icon name="calendar" size={25} color="#FF9000" />
        </TouchableOpacity>

        {modalVisible && 
          <DatePickerModal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
            }}
          >
            <DatePickerForeground>
              <DatePickerContainer>
                <DatePickerControl>
                  <TouchableHighlight
                    activeOpacity={0}
                    underlayColor="transparent"
                    onPress={() => { setModalVisible(!modalVisible)}}
                  >
                    <Icon name="x" size={25} color="black" />
                  </TouchableHighlight>
                </DatePickerControl>
                <Calendar
                  current={new Date()}
                  onDayPress={(day) => selectDayForAppointment(day)}
                  monthFormat={'dd / MM / yyyy'}
                  firstDay={1}
                  enableSwipeMonths={true}
                />

              </DatePickerContainer>
            </DatePickerForeground>
          </DatePickerModal>
        }
      </HeaderContainer>
      {appointments.length === 0 ? (
        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
          <HeaderContainerTitle style={{textAlign:'center'}}>Oops você não tem{'\n'} agendamentos hoje !</HeaderContainerTitle>
        </View>
      ):(

        <View>
        <FlatList
          data={appointments}
          renderItem={({ item: appointment }:Appointment) => (
  
            <ProviderContainer>
              <ProviderAvatar
                source={{
                  uri:
                  appointment.user.avatar ? `http://192.168.0.29:3333/files/${appointment.user.avatar}` : nonUserImage
                }}
              />
              <ProviderInfo>
                <ProviderName>{appointment.user.name}</ProviderName>
  
                <ProviderMeta>
                  <Icon name="calendar" size={14} color={theme.colors.orange} />
                  <ProviderMetaText>{`${new Date(appointment.date).getDate()}/${(new Date(appointment.date).getMonth()+1).toString().padStart(2, '0')}/${new Date(appointment.date).getFullYear()}`}</ProviderMetaText>
                </ProviderMeta>
  
                <ProviderMeta>
                  <Icon name="clock" size={14} color={theme.colors.orange} />
                  <ProviderMetaText>{`Às ${new Date("2021-01-11T19:00:00.000Z").getHours()} Horas`}</ProviderMetaText>
                </ProviderMeta>
              </ProviderInfo>
            </ProviderContainer>
          )}
          keyExtractor={item => item.id}
        />
        </View>
      )}

      
    </Container>
  );
};

export default Dashboard;
