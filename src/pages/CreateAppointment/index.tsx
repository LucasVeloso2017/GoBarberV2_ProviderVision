import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Platform, Alert } from 'react-native';
import { useTheme } from 'styled-components';
import { useRoute, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

import {
  Container,
  Header,
  BackButton,
  HeaderTitle,
  UserAvatar,
  Content,
  ProvidersListContainer,
  ProvidersList,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  Calendar,
  Title,
  OpenDatePickerButton,
  OpenDatePickerButtonText,
  Schedule,
  Section,
  SectionTitle,
  SectionContent,
  Hour,
  HourText,
  CreateAppointmentButton,
  CreateAppointmentButtonText,
} from './styles';

interface RouteParams {
  providerId: string;
}

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
  item:any
}

interface AvailabilityItem {
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  const route = useRoute();
  const { providerId } = route.params as RouteParams;
  const nonUserImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUI4ueoXqXOfnVlpC3cXaSM9BEuVni-t7qmQ&usqp=CAU"

  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(0);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState(providerId);

  const theme = useTheme();
  const { goBack, navigate } = useNavigation();
  const { user } = useAuth();

  const navigateBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleSelectProvider = useCallback((id: string) => {
    setSelectedProvider(id);
  }, []);

  const handleToggleDatePicker = useCallback(() => {
    setShowDatePicker(state => !state);
    
  }, []);

  const handleDateChanged = useCallback((_, date: Date | undefined) => {
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
    }
  }, []);

  const handleSelectHour = useCallback((hour: number) => {
    
    setSelectedHour(hour);
  }, []);

  const handleCreateAppointment = useCallback(async () => {
    try {
      const date = generateDateAppointment(selectedHour,selectedDate)
      
      await api.post('/appointments', {
        provider_id: selectedProvider,
        date
      })

      navigate('AppointmentCreated', { date: date?.getTime() });
    } catch (err) {
      Alert.alert(
        'Erro ao criar agendamento',
        'Ocorreu ao tentar criar o agendamento, tente novamente',
      );
    }
  }, [selectedProvider, selectedDate, selectedHour, navigate]);

  function generateDateAppointment(hour:number,selectedDate:Date){
    const day = (selectedDate.getDate().toString().padStart(2, '0'))
    const month = (selectedDate.getMonth()+1).toString().padStart(2, '0')
    const year = selectedDate.getFullYear()
    
    switch(hour){
      case 8:
        return new Date(`${year}-${month}-${day}T11:00:00.000Z`)
      break
      case 9:
        return new Date(`${year}-${month}-${day}T12:00:00.000Z`)
      break
      case 10:
        return new Date(`${year}-${month}-${day}T13:00:00.000Z`)
      break
      case 11:
        return new Date(`${year}-${month}-${day}T14:00:00.000Z`)
      break
      case 12:
        return new Date(`${year}-${month}-${day}T15:00:00.000Z`)
      break
      case 13:
        return new Date(`${year}-${month}-${day}T16:00:00.000Z`)
      break
      case 14:
        return new Date(`${year}-${month}-${day}T17:00:00.000Z`)
      break
      case 15:
        return new Date(`${year}-${month}-${day}T18:00:00.000Z`)
      break
      case 16:
        return new Date(`${year}-${month}-${day}T19:00:00.000Z`)
      break
      case 17:
        return new Date(`${year}-${month}-${day}T20:00:00.000Z`)
      break
    }
    
  }

  const morningAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour < 12)
      .map(({ hour, available }) => ({
        hour,
        hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        available,
      }));
  }, [availability]);

  const afternoonAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour >= 12)
      .map(({ hour, available }) => ({
        hour,
        hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        available,
      }));
  }, [availability]);


  useEffect(() => {
    api.get('/providers?key=1').then(response => {
      setProviders(response.data);
    });
  }, []);

  useEffect(() => {
    api
      .get(`/providers/${selectedProvider}/day-availability?day=${selectedDate.getDate()}&month=${selectedDate.getMonth()+1}&year=${selectedDate.getFullYear()}`)
      .then(response => {
        setAvailability(response.data);
      });
  }, [selectedDate, selectedProvider]);


  return (
    <Container>
      <Header>
        <BackButton onPress={navigateBack}>
          <Icon name="chevron-left" size={24} color={theme.colors.gray} />
        </BackButton>

        <HeaderTitle>Cabeleireiros</HeaderTitle>

        <UserAvatar
          source={{
            uri:
              user.avatar_url ? user.avatar_url : nonUserImage,
          }}
        />
      </Header>

      <Content>
        <ProvidersListContainer>
          <ProvidersList
            data={providers}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(provider:Provider) => provider.id}
            renderItem={({ item: provider }:Provider) => (
              <ProviderContainer
                onPress={() => handleSelectProvider(provider.id)}
                selected={provider.id === selectedProvider}
              >
                <ProviderAvatar
                  source={{
                    uri:
                      provider.avatar_url ? provider.avatar_url : nonUserImage,
                  }}
                />
                <ProviderName selected={provider.id === selectedProvider}>
                  {provider.name}
                </ProviderName>
              </ProviderContainer>
            )}
          />
        </ProvidersListContainer>

        <Calendar>
          <Title>Escolha a data</Title>

          <OpenDatePickerButton onPress={handleToggleDatePicker}>
            <OpenDatePickerButtonText>
              Selecionar outra data
            </OpenDatePickerButtonText>
          </OpenDatePickerButton>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              onChange={handleDateChanged}
              mode="date"
              display="calendar"
              textColor={theme.colors.white}
            />
          )}
        </Calendar>

        <Schedule>
          <Title>Escolha o horário</Title>

          <Section>
            <SectionTitle>Manhã</SectionTitle>

            <SectionContent>
              {morningAvailability.map(({ hour, hourFormatted, available }) => (
                <Hour
                  enabled={available}
                  selected={selectedHour === hour}
                  available={available}
                  key={hourFormatted}
                  onPress={() => handleSelectHour(hour)}
                >
                  <HourText selected={selectedHour === hour}>
                    {hourFormatted}
                  </HourText>
                </Hour>
              ))}
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Tarde</SectionTitle>

            <SectionContent>
              {afternoonAvailability.map(
                ({ hour, hourFormatted, available }) => (
                  <Hour
                    enabled={available}
                    selected={selectedHour === hour}
                    available={available}
                    key={hourFormatted}
                    onPress={() => handleSelectHour(hour)}
                  >
                    <HourText selected={selectedHour === hour}>
                      {hourFormatted}
                    </HourText>
                  </Hour>
                ),
              )}
            </SectionContent>
          </Section>
        </Schedule>

        <CreateAppointmentButton onPress={handleCreateAppointment}>
          <CreateAppointmentButtonText>Agendar</CreateAppointmentButtonText>
        </CreateAppointmentButton>
      </Content>
    </Container>
  );
};

export default CreateAppointment;
